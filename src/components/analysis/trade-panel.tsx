'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import type { DurationLimits, ProposalInfo, BuyResult } from '@deriv/core';
import type {
  AnalysisTradeType,
  AnalysisContractMode,
} from '@/hooks/use-analysis-tool';

interface TradePanelProps {
  isAuthenticated: boolean;
  onLogin: () => Promise<void>;
  onSignUp: () => Promise<void>;
  isConnected: boolean;

  tradeType: AnalysisTradeType;
  setTradeType: (t: AnalysisTradeType) => void;
  contractMode: AnalysisContractMode;
  setContractMode: (m: AnalysisContractMode) => void;
  barrierDigit: number;

  digitsAvailable: boolean;
  riseFallAvailable: boolean;

  stake: string;
  setStake: (v: string) => void;
  duration: number;
  setDuration: (v: number) => void;
  durationLimits: DurationLimits;

  proposal: ProposalInfo | null;
  isProposalLoading: boolean;
  onBuy: () => void;
  isBuying: boolean;
  buyResult: BuyResult | null;
  buyError: string | null;
  onClearBuyResult: () => void;
}

const TRADE_TYPE_OPTIONS: { value: AnalysisTradeType; label: string }[] = [
  { value: 'rise-fall', label: 'Rise/Fall' },
  { value: 'even-odd', label: 'Even/Odd' },
  { value: 'over-under', label: 'Over/Under' },
];

const MODE_OPTIONS: Record<
  AnalysisTradeType,
  { value: AnalysisContractMode; label: string; tone: 'up' | 'down' }[]
> = {
  'rise-fall': [
    { value: 'CALL', label: 'Rise ▲', tone: 'up' },
    { value: 'PUT', label: 'Fall ▼', tone: 'down' },
  ],
  'even-odd': [
    { value: 'DIGITEVEN', label: 'Even', tone: 'up' },
    { value: 'DIGITODD', label: 'Odd', tone: 'down' },
  ],
  'over-under': [
    { value: 'DIGITOVER', label: 'Over', tone: 'up' },
    { value: 'DIGITUNDER', label: 'Under', tone: 'down' },
  ],
};

function predictionText(
  mode: AnalysisContractMode,
  barrier: number
): string {
  switch (mode) {
    case 'CALL':
      return 'The market will rise above the entry spot.';
    case 'PUT':
      return 'The market will fall below the entry spot.';
    case 'DIGITEVEN':
      return 'The last digit will be even.';
    case 'DIGITODD':
      return 'The last digit will be odd.';
    case 'DIGITOVER':
      return `The last digit will be over ${barrier}.`;
    case 'DIGITUNDER':
      return `The last digit will be under ${barrier}.`;
  }
}

export function TradePanel(props: TradePanelProps) {
  const {
    isAuthenticated,
    onLogin,
    onSignUp,
    isConnected,
    tradeType,
    setTradeType,
    contractMode,
    setContractMode,
    barrierDigit,
    digitsAvailable,
    riseFallAvailable,
    stake,
    setStake,
    duration,
    setDuration,
    durationLimits,
    proposal,
    isProposalLoading,
    onBuy,
    isBuying,
    buyResult,
    buyError,
    onClearBuyResult,
  } = props;

  useEffect(() => {
    if (buyError) {
      toast.error('Purchase failed', { description: buyError });
      onClearBuyResult();
    }
  }, [buyError, onClearBuyResult]);

  useEffect(() => {
    if (buyResult) {
      toast.success('Contract purchased', {
        description: `Buy: ${buyResult.buyPrice.toFixed(2)} USD · Payout: ${buyResult.payout.toFixed(
          2
        )} USD · Balance: ${buyResult.balanceAfter.toFixed(2)} USD`,
      });
      onClearBuyResult();
    }
  }, [buyResult, onClearBuyResult]);

  const modeOptions = MODE_OPTIONS[tradeType];
  const durationUnitLabel = (durationLimits.unit || 't') === 't' ? 'Ticks' : durationLimits.unit;

  return (
    <div className="space-y-4">
      {/* Trade type */}
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">Trade type</Label>
        <ToggleGroup
          type="single"
          value={tradeType}
          onValueChange={(v) => v && setTradeType(v as AnalysisTradeType)}
          className="w-full gap-0 rounded-full bg-muted p-1"
        >
          {TRADE_TYPE_OPTIONS.map((opt) => {
            const disabled =
              opt.value === 'rise-fall' ? !riseFallAvailable : !digitsAvailable;
            return (
              <ToggleGroupItem
                key={opt.value}
                value={opt.value}
                disabled={disabled}
                className="flex-1 rounded-full text-xs font-medium text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-primary data-[state=on]:font-bold data-[state=on]:shadow-sm disabled:opacity-40"
              >
                {opt.label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>

      {/* Direction */}
      <div className="grid grid-cols-2 gap-2">
        {modeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setContractMode(opt.value)}
            className={cn(
              'rounded-lg border py-2.5 text-sm font-bold transition-colors',
              contractMode === opt.value
                ? opt.tone === 'up'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                  : 'border-rose-500 bg-rose-500/10 text-rose-600'
                : 'border-border text-muted-foreground hover:bg-muted/50'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Stake + duration */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="stake" className="text-xs text-muted-foreground">
            Stake
          </Label>
          <Input
            id="stake"
            type="number"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
            }}
            min={0}
            step="0.01"
            labelRight="USD"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration" className="text-xs text-muted-foreground">
            Duration
          </Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) setDuration(val);
            }}
            min={durationLimits.min}
            max={durationLimits.max}
            step={1}
            labelRight={durationUnitLabel}
          />
        </div>
      </div>

      {/* Prediction + payout */}
      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-[11px] text-muted-foreground">Prediction</p>
        <p className="text-sm font-medium">{predictionText(contractMode, barrierDigit)}</p>
        {(proposal || isProposalLoading) && (
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-xs text-muted-foreground">Potential payout</span>
            {isProposalLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="text-sm font-bold">{proposal!.payout.toFixed(2)} USD</span>
            )}
          </div>
        )}
      </div>

      {/* Action */}
      {isAuthenticated ? (
        <Button
          className="h-11 w-full rounded-full"
          disabled={!isConnected || !proposal || isBuying}
          onClick={onBuy}
        >
          {isBuying
            ? 'Purchasing…'
            : proposal
              ? `Buy @ ${proposal.askPrice.toFixed(2)} USD`
              : 'Buy contract'}
        </Button>
      ) : (
        <div className="space-y-2 rounded-lg border border-dashed border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Log in to your Deriv account to place trades. Analysis stays live either way.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onLogin}>
              Log in
            </Button>
            <Button className="flex-1" onClick={onSignUp}>
              Sign up
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
