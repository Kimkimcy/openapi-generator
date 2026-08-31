'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/custom/header';
import { useDerivWSContext } from '@/components/custom/deriv-ws-provider';
import { useLogoSrc } from '@/components/custom/logo-src-provider';
import { useAnalysisTool } from '@/hooks/use-analysis-tool';
import { categorizeSymbol, MARKET_CATEGORY_LABELS } from '@/lib/market-groups';
import { MarketSelector } from './market-selector';
import { TickChart } from './tick-chart';
import { DigitDistribution } from './digit-distribution';
import { EvenOddCard } from './even-odd-card';
import { OverUnderCard } from './over-under-card';
import { RiseFallCard } from './rise-fall-card';
import { TradePanel } from './trade-panel';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <svg className="h-5 w-5 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg className="hidden h-5 w-5 dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </Button>
  );
}

export function AnalysisDashboard() {
  const logoSrc = useLogoSrc();
  const { ws, isConnected, isExhausted, auth } = useDerivWSContext();
  const {
    authState,
    accounts,
    activeAccount,
    login,
    signUp,
    logout,
    switchAccount,
  } = auth;

  const tool = useAnalysisTool({
    ws,
    isConnected,
    isExhausted,
    isAuthenticated: !!auth.wsUrl,
    onAuthWSFailed: logout,
    currency: activeAccount?.currency,
  });

  const category = tool.activeSymbol ? categorizeSymbol(tool.activeSymbol) : null;
  const isAuthenticated = authState === 'authenticated';

  return (
    <div className="min-h-dvh bg-background">
      <Header
        authState={authState}
        accounts={accounts}
        activeAccount={activeAccount}
        onLogin={login}
        onSignUp={signUp}
        onLogout={logout}
        onSwitchAccount={switchAccount}
        logoSrc={logoSrc}
        actions={<ThemeToggle />}
      />

      <main className="mx-auto max-w-7xl px-3 pb-16 pt-20 sm:px-4">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Market Analysis
            </h2>
            <p className="text-sm text-muted-foreground">
              Live digit, even/odd, over/under and rise/fall statistics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MarketSelector
              symbols={tool.symbols}
              activeSymbol={tool.activeSymbol}
              onSymbolChange={tool.selectSymbol}
            />
            <span
              className={`flex h-2.5 w-2.5 shrink-0 rounded-full ${
                tool.isConnected ? 'bg-emerald-500' : 'bg-muted-foreground/40'
              }`}
              title={tool.isConnected ? 'Connected' : 'Disconnected'}
              aria-label={tool.isConnected ? 'Connected' : 'Disconnected'}
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Chart + current price */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">
                  {tool.activeSymbol?.underlying_symbol_name ?? 'Live ticks'}
                </CardTitle>
                {category && (
                  <Badge variant="secondary" className="text-[10px]">
                    {MARKET_CATEGORY_LABELS[category]}
                  </Badge>
                )}
              </div>
              {tool.lastDigit !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Last digit</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground tabular-nums">
                    {tool.lastDigit}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <TickChart prices={tool.prices} pipSize={tool.pipSize} />
            </CardContent>
          </Card>

          {/* Trade panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Place a trade</CardTitle>
            </CardHeader>
            <CardContent>
              <TradePanel
                isAuthenticated={isAuthenticated}
                onLogin={login}
                onSignUp={signUp}
                isConnected={tool.isConnected}
                tradeType={tool.tradeType}
                setTradeType={tool.setTradeType}
                contractMode={tool.contractMode}
                setContractMode={tool.setContractMode}
                barrierDigit={tool.barrierDigit}
                digitsAvailable={tool.digitsAvailable}
                riseFallAvailable={tool.riseFallAvailable}
                stake={tool.stake}
                setStake={tool.setStake}
                duration={tool.duration}
                setDuration={tool.setDuration}
                durationLimits={tool.durationLimits}
                proposal={tool.proposal}
                isProposalLoading={tool.isProposalLoading}
                onBuy={tool.buyContract}
                isBuying={tool.isBuying}
                buyResult={tool.buyResult}
                buyError={tool.buyError}
                onClearBuyResult={tool.clearBuyResult}
              />
            </CardContent>
          </Card>

          {/* Digit distribution (wide) */}
          <div className="lg:col-span-3">
            <DigitDistribution stats={tool.digitStats} lastDigit={tool.lastDigit} />
          </div>

          {/* Analysis trio */}
          <RiseFallCard stats={tool.riseFall} />
          <EvenOddCard stats={tool.evenOdd} />
          <OverUnderCard
            stats={tool.overUnder}
            barrier={tool.barrierDigit}
            onBarrierChange={tool.setBarrierDigit}
          />
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          Statistics are derived from a live tick window and are for informational
          purposes only. Trading involves risk. This is an independent third-party
          tool and is not affiliated with or endorsed by Deriv.
        </p>
      </main>
    </div>
  );
}
