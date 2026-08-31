'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { OverUnderStats } from '@/lib/analysis';

interface OverUnderCardProps {
  stats: OverUnderStats;
  barrier: number;
  onBarrierChange: (digit: number) => void;
}

export function OverUnderCard({ stats, barrier, onBarrierChange }: OverUnderCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">Over / Under</CardTitle>
        <span className="text-xs text-muted-foreground">Barrier: {barrier}</span>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex h-8 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="flex items-center justify-start bg-emerald-500 pl-2.5 text-xs font-bold text-white transition-[width] duration-300"
            style={{ width: `${stats.underPct}%` }}
          >
            {stats.underPct >= 14 ? `${stats.underPct.toFixed(1)}%` : ''}
          </div>
          <div
            className="flex items-center justify-center bg-muted-foreground/30 text-[10px] font-medium text-foreground transition-[width] duration-300"
            style={{ width: `${stats.equalPct}%` }}
          />
          <div className="flex flex-1 items-center justify-end bg-rose-500 pr-2.5 text-xs font-bold text-white">
            {stats.overPct >= 14 ? `${stats.overPct.toFixed(1)}%` : ''}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-emerald-500/10 py-2">
            <p className="text-xs font-medium text-emerald-600">Under {barrier}</p>
            <p className="text-base font-bold tabular-nums">{stats.underPct.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg bg-muted py-2">
            <p className="text-xs font-medium text-muted-foreground">Equal</p>
            <p className="text-base font-bold tabular-nums">{stats.equalPct.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 py-2">
            <p className="text-xs font-medium text-rose-600">Over {barrier}</p>
            <p className="text-base font-bold tabular-nums">{stats.overPct.toFixed(1)}%</p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] text-muted-foreground">Barrier digit</p>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onBarrierChange(d)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold tabular-nums transition-colors',
                  d === barrier
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
