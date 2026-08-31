import { getLastDigit } from './digit-stats';

/** Even / Odd distribution over a price window. */
export interface EvenOddStats {
  even: number;
  odd: number;
  evenPct: number;
  oddPct: number;
  total: number;
}

export function computeEvenOdd(prices: number[], pipSize: number): EvenOddStats {
  let even = 0;
  let odd = 0;
  for (const price of prices) {
    const digit = getLastDigit(price, pipSize);
    if (digit % 2 === 0) even++;
    else odd++;
  }
  const total = prices.length;
  return {
    even,
    odd,
    evenPct: total > 0 ? (even / total) * 100 : 0,
    oddPct: total > 0 ? (odd / total) * 100 : 0,
    total,
  };
}

/** Over / Under distribution relative to a barrier digit. */
export interface OverUnderStats {
  over: number;
  under: number;
  equal: number;
  overPct: number;
  underPct: number;
  equalPct: number;
  total: number;
  barrier: number;
}

export function computeOverUnder(
  prices: number[],
  pipSize: number,
  barrier: number
): OverUnderStats {
  let over = 0;
  let under = 0;
  let equal = 0;
  for (const price of prices) {
    const digit = getLastDigit(price, pipSize);
    if (digit > barrier) over++;
    else if (digit < barrier) under++;
    else equal++;
  }
  const total = prices.length;
  return {
    over,
    under,
    equal,
    overPct: total > 0 ? (over / total) * 100 : 0,
    underPct: total > 0 ? (under / total) * 100 : 0,
    equalPct: total > 0 ? (equal / total) * 100 : 0,
    total,
    barrier,
  };
}

export interface Streak {
  direction: 'rise' | 'fall' | 'none';
  length: number;
}

/** Rise / Fall distribution comparing each tick to the previous one. */
export interface RiseFallStats {
  rise: number;
  fall: number;
  noChange: number;
  risePct: number;
  fallPct: number;
  total: number;
  streak: Streak;
}

export function computeRiseFall(prices: number[]): RiseFallStats {
  let rise = 0;
  let fall = 0;
  let noChange = 0;

  for (let i = 1; i < prices.length; i++) {
    const delta = prices[i] - prices[i - 1];
    if (delta > 0) rise++;
    else if (delta < 0) fall++;
    else noChange++;
  }

  // Current streak of consecutive rises/falls at the end of the window.
  let streakDir: Streak['direction'] = 'none';
  let streakLen = 0;
  for (let i = prices.length - 1; i > 0; i--) {
    const delta = prices[i] - prices[i - 1];
    const dir: Streak['direction'] = delta > 0 ? 'rise' : delta < 0 ? 'fall' : 'none';
    if (dir === 'none') break;
    if (streakDir === 'none') {
      streakDir = dir;
      streakLen = 1;
    } else if (dir === streakDir) {
      streakLen++;
    } else {
      break;
    }
  }

  const total = rise + fall + noChange;
  return {
    rise,
    fall,
    noChange,
    risePct: total > 0 ? (rise / total) * 100 : 0,
    fallPct: total > 0 ? (fall / total) * 100 : 0,
    total,
    streak: { direction: streakDir, length: streakLen },
  };
}
