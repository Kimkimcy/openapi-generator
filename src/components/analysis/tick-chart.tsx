'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TickChartProps {
  prices: number[];
  pipSize: number;
  /** Number of most-recent ticks to plot. */
  window?: number;
  className?: string;
}

const WIDTH = 600;
const HEIGHT = 200;
const PAD_X = 8;
const PAD_Y = 12;

/**
 * Lightweight live line chart of the most recent ticks. Rendered as a plain
 * SVG (no chart library) so it can repaint on every incoming tick without
 * layout thrash.
 */
export function TickChart({ prices, pipSize, window = 120, className }: TickChartProps) {
  const view = useMemo(() => {
    const data = prices.slice(-window);
    if (data.length < 2) return null;

    let min = Infinity;
    let max = -Infinity;
    for (const p of data) {
      if (p < min) min = p;
      if (p > max) max = p;
    }
    const range = max - min || 1;

    const stepX = (WIDTH - PAD_X * 2) / (data.length - 1);
    const points = data.map((p, i) => {
      const x = PAD_X + i * stepX;
      const y = PAD_Y + (HEIGHT - PAD_Y * 2) * (1 - (p - min) / range);
      return { x, y, p };
    });

    const line = points.map((pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`).join(' ');
    const area = `${PAD_X},${HEIGHT - PAD_Y} ${line} ${points[points.length - 1].x.toFixed(
      2
    )},${HEIGHT - PAD_Y}`;

    const first = data[0];
    const last = data[data.length - 1];
    const isUp = last >= first;

    return {
      line,
      area,
      last: points[points.length - 1],
      lastPrice: last,
      min,
      max,
      isUp,
      count: data.length,
    };
  }, [prices, window]);

  const stroke = view?.isUp ? 'var(--color-emerald-500, #10b981)' : 'var(--color-rose-500, #f43f5e)';

  return (
    <div className={cn('relative w-full', className)}>
      {view ? (
        <>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="h-48 w-full"
            role="img"
            aria-label="Live price chart of recent ticks"
          >
            <defs>
              <linearGradient id="tick-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={view.area} fill="url(#tick-fill)" />
            <polyline
              points={view.line}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={view.last.x} cy={view.last.y} r={3.5} fill={stroke} />
          </svg>
          <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 text-xs font-medium tabular-nums backdrop-blur-sm">
            <span className={view.isUp ? 'text-emerald-600' : 'text-rose-600'}>
              {view.lastPrice.toFixed(pipSize)}
            </span>
            <span aria-hidden className={view.isUp ? 'text-emerald-600' : 'text-rose-600'}>
              {view.isUp ? '▲' : '▼'}
            </span>
          </div>
          <div className="pointer-events-none absolute left-2 top-2 text-[10px] text-muted-foreground tabular-nums">
            {view.max.toFixed(pipSize)}
          </div>
          <div className="pointer-events-none absolute bottom-2 left-2 text-[10px] text-muted-foreground tabular-nums">
            {view.min.toFixed(pipSize)}
          </div>
        </>
      ) : (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Waiting for live ticks…
        </div>
      )}
    </div>
  );
}
