'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RiseFallStats } from '@/lib/analysis';

interface RiseFallCardProps {
  stats: RiseFallStats;
}

export function RiseFallCard({ stats }: RiseFallCardProps) {
  const { streak } = stats;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">Rise / Fall</CardTitle>
        {streak.direction !== 'none' && streak.length > 0 && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              streak.direction === 'rise'
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-rose-500/10 text-rose-600'
            )}
          >
            {streak.length}x {streak.direction === 'rise' ? '▲' : '▼'} streak
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex h-8 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="flex items-center justify-start bg-emerald-500 pl-2.5 text-xs font-bold text-white transition-[width] duration-300"
            style={{ width: `${stats.risePct}%` }}
          >
            {stats.risePct >= 12 ? `${stats.risePct.toFixed(1)}%` : ''}
          </div>
          <div className="flex flex-1 items-center justify-end bg-rose-500 pr-2.5 text-xs font-bold text-white">
            {stats.fallPct >= 12 ? `${stats.fallPct.toFixed(1)}%` : ''}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-emerald-500/10 py-2">
            <p className="text-xs font-medium text-emerald-600">Rise ▲</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {stats.risePct.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted-foreground tabular-nums">{stats.rise}</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 py-2">
            <p className="text-xs font-medium text-rose-600">Fall ▼</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {stats.fallPct.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted-foreground tabular-nums">{stats.fall}</p>
          </div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          Based on {stats.total} tick-to-tick moves
        </p>
      </CardContent>
    </Card>
  );
}
