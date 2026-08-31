'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DigitStats } from '@/lib/types';

interface DigitDistributionProps {
  stats: DigitStats;
  lastDigit: number | null;
}

export function DigitDistribution({ stats, lastDigit }: DigitDistributionProps) {
  const maxPct = Math.max(...stats.percentages, 1);
  const hotIndex = stats.percentages.indexOf(Math.max(...stats.percentages));
  const coldIndex = stats.percentages.indexOf(Math.min(...stats.percentages));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">Last Digit Distribution</CardTitle>
        <span className="text-xs text-muted-foreground tabular-nums">
          {stats.totalTicks} ticks
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-1.5 sm:gap-2">
          {stats.percentages.map((pct, digit) => {
            const isCurrent = digit === lastDigit;
            const isHot = digit === hotIndex && stats.totalTicks > 0;
            const isCold = digit === coldIndex && stats.totalTicks > 0;
            return (
              <div key={digit} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                  {pct.toFixed(1)}%
                </span>
                <div className="flex h-24 w-full items-end overflow-hidden rounded-md bg-muted/50">
                  <div
                    className={cn(
                      'w-full rounded-md transition-[height] duration-300',
                      isHot
                        ? 'bg-emerald-500'
                        : isCold
                          ? 'bg-rose-500'
                          : 'bg-primary/60'
                    )}
                    style={{ height: `${(pct / maxPct) * 100}%` }}
                  />
                </div>
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors',
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {digit}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Most frequent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Least frequent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> Current
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
