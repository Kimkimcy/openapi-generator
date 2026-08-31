'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useProposal, useBuy } from '@deriv/core';
import type {
  ActiveSymbol,
  Tick,
  ProposalInfo,
  ProposalParams,
  DurationLimits,
  BuyResult,
} from '@deriv/core';
import { useBaseTrading } from '@/hooks/use-base-trading';
import type { UseBaseTradingParams } from '@/hooks/use-base-trading';
import { computeDigitStats, getLastDigit } from '@/lib/digit-stats';
import {
  computeEvenOdd,
  computeOverUnder,
  computeRiseFall,
  type EvenOddStats,
  type OverUnderStats,
  type RiseFallStats,
} from '@/lib/analysis';
import {
  filterSupportedSymbols,
  pickAnalysisDefault,
} from '@/lib/market-groups';
import type { DigitStats } from '@/lib/types';

/** Contract types requested so the symbol list covers synthetics + forex/commodities. */
const CONTRACT_TYPES = [
  'DIGITOVER',
  'DIGITUNDER',
  'DIGITEVEN',
  'DIGITODD',
  'CALL',
  'PUT',
];

/** The three tradable analyses the user selected. */
export type AnalysisTradeType = 'rise-fall' | 'even-odd' | 'over-under';

export type AnalysisContractMode =
  | 'CALL'
  | 'PUT'
  | 'DIGITEVEN'
  | 'DIGITODD'
  | 'DIGITOVER'
  | 'DIGITUNDER';

const DEFAULT_MODE: Record<AnalysisTradeType, AnalysisContractMode> = {
  'rise-fall': 'CALL',
  'even-odd': 'DIGITEVEN',
  'over-under': 'DIGITOVER',
};

export interface UseAnalysisToolReturn {
  isConnected: boolean;
  isLoading: boolean;
  symbols: ActiveSymbol[];
  activeSymbol: ActiveSymbol | null;
  selectSymbol: (symbol: string) => void;
  currentTick: Tick | null;
  prices: number[];
  pipSize: number;
  lastDigit: number | null;

  // Analysis stats
  digitStats: DigitStats;
  evenOdd: EvenOddStats;
  overUnder: OverUnderStats;
  riseFall: RiseFallStats;

  // Contract availability for the active symbol
  digitsAvailable: boolean;
  riseFallAvailable: boolean;

  // Trade state
  tradeType: AnalysisTradeType;
  setTradeType: (type: AnalysisTradeType) => void;
  contractMode: AnalysisContractMode;
  setContractMode: (mode: AnalysisContractMode) => void;
  barrierDigit: number;
  setBarrierDigit: (digit: number) => void;
  stake: string;
  setStake: (value: string) => void;
  duration: number;
  setDuration: (value: number) => void;
  durationLimits: DurationLimits;

  // Proposal + buy
  proposal: ProposalInfo | null;
  isProposalLoading: boolean;
  buyContract: () => Promise<void>;
  isBuying: boolean;
  buyResult: BuyResult | null;
  buyError: string | null;
  clearBuyResult: () => void;
}

export type UseAnalysisToolParams = Pick<
  UseBaseTradingParams,
  'ws' | 'isConnected' | 'isExhausted' | 'isAuthenticated' | 'onAuthWSFailed'
> & {
  /** Currency of the active account; falls back to USD for the public feed. */
  currency?: string;
};

export function useAnalysisTool({
  ws,
  isConnected,
  isExhausted,
  isAuthenticated,
  onAuthWSFailed,
  currency,
}: UseAnalysisToolParams): UseAnalysisToolReturn {
  const {
    ws: tradingWs,
    isConnected: tradingIsConnected,
    isLoading,
    symbols: allSymbols,
    activeSymbol,
    selectSymbol,
    currentTick,
    prices,
    pipSize,
    contracts,
    durationLimits,
  } = useBaseTrading({
    ws,
    isConnected,
    isExhausted,
    isAuthenticated,
    onAuthWSFailed,
    contractTypes: CONTRACT_TYPES,
  });

  // Restrict to the categories the user asked for.
  const symbols = useMemo(
    () => filterSupportedSymbols(allSymbols),
    [allSymbols]
  );

  // On first symbol load, prefer a volatility index so digit analyses are
  // meaningful out of the box.
  const didPickDefault = useRef(false);
  useEffect(() => {
    if (didPickDefault.current) return;
    if (symbols.length === 0) return;
    const inSupported =
      activeSymbol && symbols.some((s) => s.underlying_symbol === activeSymbol.underlying_symbol);
    if (!inSupported) {
      const preferred = pickAnalysisDefault(symbols);
      if (preferred) selectSymbol(preferred.underlying_symbol);
    }
    didPickDefault.current = true;
  }, [symbols, activeSymbol, selectSymbol]);

  // Which contract families the active symbol supports.
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    for (const c of contracts) set.add(c.contract_type);
    return set;
  }, [contracts]);

  const digitsAvailable =
    availableTypes.has('DIGITEVEN') || availableTypes.has('DIGITOVER');
  const riseFallAvailable = availableTypes.has('CALL') || availableTypes.has('PUT');

  // Trade state
  const [tradeType, setTradeTypeRaw] = useState<AnalysisTradeType>('rise-fall');
  const [contractMode, setContractMode] = useState<AnalysisContractMode>('CALL');
  const [barrierDigit, setBarrierDigit] = useState<number>(5);
  const [stake, setStake] = useState<string>('10');
  const [duration, setDuration] = useState<number>(5);

  const setTradeType = useCallback((type: AnalysisTradeType) => {
    setTradeTypeRaw(type);
    setContractMode(DEFAULT_MODE[type]);
  }, []);

  // If the current symbol doesn't support the selected trade type, fall back to
  // an available one (e.g. forex has no digit contracts).
  useEffect(() => {
    if (tradeType !== 'rise-fall' && !digitsAvailable && riseFallAvailable) {
      setTradeTypeRaw('rise-fall');
      setContractMode('CALL');
    } else if (tradeType === 'rise-fall' && !riseFallAvailable && digitsAvailable) {
      setTradeTypeRaw('even-odd');
      setContractMode('DIGITEVEN');
    }
  }, [tradeType, digitsAvailable, riseFallAvailable]);

  // Keep duration within the symbol's limits.
  useEffect(() => {
    setDuration((d) => {
      const clamped = Math.min(Math.max(d, durationLimits.min), durationLimits.max);
      return clamped === d ? d : clamped;
    });
  }, [durationLimits.min, durationLimits.max]);

  // Analysis computations from the tick window.
  const digitStats = useMemo(
    () => computeDigitStats(prices, pipSize),
    [prices, pipSize]
  );
  const evenOdd = useMemo(() => computeEvenOdd(prices, pipSize), [prices, pipSize]);
  const overUnder = useMemo(
    () => computeOverUnder(prices, pipSize, barrierDigit),
    [prices, pipSize, barrierDigit]
  );
  const riseFall = useMemo(() => computeRiseFall(prices), [prices]);

  const lastDigit = useMemo(() => {
    if (currentTick) return getLastDigit(currentTick.quote, pipSize);
    if (prices.length > 0) return getLastDigit(prices[prices.length - 1], pipSize);
    return null;
  }, [currentTick, prices, pipSize]);

  const {
    buyContract: buyWithProposal,
    isBuying,
    buyResult,
    buyError,
    clearBuyResult,
  } = useBuy(tradingWs, tradingIsConnected);

  const proposalParams: ProposalParams | null = useMemo(() => {
    if (isBuying || !activeSymbol) return null;
    const stakeNum = parseFloat(stake);
    if (!stakeNum || stakeNum <= 0) return null;

    const needsBarrier = contractMode === 'DIGITOVER' || contractMode === 'DIGITUNDER';

    return {
      contractType: contractMode,
      symbol: activeSymbol.underlying_symbol,
      amount: stakeNum,
      duration,
      durationUnit: durationLimits.unit || 't',
      basis: 'stake',
      currency: currency ?? 'USD',
      ...(needsBarrier ? { barrier: barrierDigit } : {}),
    };
  }, [
    activeSymbol,
    contractMode,
    stake,
    duration,
    durationLimits.unit,
    barrierDigit,
    isBuying,
    currency,
  ]);

  const { proposal } = useProposal(tradingWs, tradingIsConnected, proposalParams);

  const buyContract = useCallback(async () => {
    if (proposal) await buyWithProposal(proposal);
  }, [proposal, buyWithProposal]);

  return {
    isConnected,
    isLoading,
    symbols,
    activeSymbol,
    selectSymbol,
    currentTick,
    prices,
    pipSize,
    lastDigit,
    digitStats,
    evenOdd,
    overUnder,
    riseFall,
    digitsAvailable,
    riseFallAvailable,
    tradeType,
    setTradeType,
    contractMode,
    setContractMode,
    barrierDigit,
    setBarrierDigit,
    stake,
    setStake,
    duration,
    setDuration,
    durationLimits,
    proposal,
    isProposalLoading:
      isConnected && proposalParams !== null && proposal === null,
    buyContract,
    isBuying,
    buyResult,
    buyError,
    clearBuyResult,
  };
}
