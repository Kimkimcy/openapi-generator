'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EvenOddStats } from '@/lib/analysis';

interface EvenOddCardProps {
  stats: EvenOddStats;
}

export function EvenOddCard({ stats }: EvenOddCardProps) {
  const even = stats.evenPct;
  const odd = stats.oddPct;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Even / Odd</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex h-8 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="flex items-center justify-start bg-sky-500 pl-2.5 text-xs font-bold text-white transition-[width] duration-300"
            style={{ width: `${even}%` }}
          >
            {even >= 12 ? `${even.toFixed(1)}%` : ''}
          </div>
          <div
            className="flex flex-1 items-center justify-end bg-violet-500 pr-2.5 text-xs font-bold text-white transition-[width] duration-300"
          >
            {odd >= 12 ? `${odd.toFixed(1)}%` : ''}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-sky-500/10 py-2">
            <p className="text-xs font-medium text-sky-600">Even</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {stats.evenPct.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted-foreground tabular-nums">{stats.even}</p>
          </div>
          <div className="rounded-lg bg-violet-500/10 py-2">
            <p className="text-xs font-medium text-violet-600">Odd</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {stats.oddPct.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted-foreground tabular-nums">{stats.odd}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
