import type { ActiveSymbol } from '@deriv/core';

/**
 * The market categories the analysis tool exposes. The user selected:
 * Volatility indices, Jump indices, and Forex / commodities.
 */
export type MarketCategory =
  | 'volatility'
  | 'jump'
  | 'forex'
  | 'commodities';

export const MARKET_CATEGORY_LABELS: Record<MarketCategory, string> = {
  volatility: 'Volatility Indices',
  jump: 'Jump Indices',
  forex: 'Forex',
  commodities: 'Commodities',
};

/** Display order of the categories in the selector. */
export const MARKET_CATEGORY_ORDER: MarketCategory[] = [
  'volatility',
  'jump',
  'forex',
  'commodities',
];

/**
 * Classify a Deriv active symbol into one of the supported categories, or
 * null when it falls outside the requested markets.
 */
export function categorizeSymbol(symbol: ActiveSymbol): MarketCategory | null {
  const submarket = symbol.submarket;
  const market = symbol.market;

  if (submarket === 'random_index') return 'volatility';
  if (submarket === 'jump_index') return 'jump';
  if (market === 'forex') return 'forex';
  if (market === 'commodities') return 'commodities';
  return null;
}

export interface CategoryGroup {
  category: MarketCategory;
  label: string;
  symbols: ActiveSymbol[];
}

/** Group symbols into the supported categories, preserving the display order. */
export function groupSymbolsByCategory(symbols: ActiveSymbol[]): CategoryGroup[] {
  const buckets = new Map<MarketCategory, ActiveSymbol[]>();

  for (const symbol of symbols) {
    const category = categorizeSymbol(symbol);
    if (!category) continue;
    const existing = buckets.get(category);
    if (existing) existing.push(symbol);
    else buckets.set(category, [symbol]);
  }

  return MARKET_CATEGORY_ORDER.filter((category) => buckets.has(category)).map(
    (category) => ({
      category,
      label: MARKET_CATEGORY_LABELS[category],
      symbols: (buckets.get(category) ?? []).sort((a, b) =>
        a.underlying_symbol_name.localeCompare(b.underlying_symbol_name)
      ),
    })
  );
}

/** Keep only symbols that belong to one of the supported categories. */
export function filterSupportedSymbols(symbols: ActiveSymbol[]): ActiveSymbol[] {
  return symbols.filter((s) => categorizeSymbol(s) !== null);
}

/**
 * Choose a sensible default symbol: prefer a Volatility 100 index (rich
 * last-digit behaviour), then any volatility index, then the first supported.
 */
export function pickAnalysisDefault(symbols: ActiveSymbol[]): ActiveSymbol | null {
  const supported = filterSupportedSymbols(symbols);
  if (supported.length === 0) return null;
  return (
    supported.find((s) => s.underlying_symbol === 'R_100') ??
    supported.find((s) => s.underlying_symbol === '1HZ100V') ??
    supported.find((s) => categorizeSymbol(s) === 'volatility') ??
    supported[0]
  );
}
