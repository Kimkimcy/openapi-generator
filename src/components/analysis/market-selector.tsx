'use client';

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ActiveSymbol } from '@deriv/core';
import { groupSymbolsByCategory } from '@/lib/market-groups';

interface MarketSelectorProps {
  symbols: ActiveSymbol[];
  activeSymbol: ActiveSymbol | null;
  onSymbolChange: (symbol: string) => void;
}

export function MarketSelector({
  symbols,
  activeSymbol,
  onSymbolChange,
}: MarketSelectorProps) {
  const groups = useMemo(() => groupSymbolsByCategory(symbols), [symbols]);

  return (
    <Select value={activeSymbol?.underlying_symbol ?? ''} onValueChange={onSymbolChange}>
      <SelectTrigger className="w-full sm:w-72">
        <SelectValue placeholder="Select a market" />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectGroup key={group.category}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.symbols.map((symbol) => (
              <SelectItem
                key={symbol.underlying_symbol}
                value={symbol.underlying_symbol}
              >
                {symbol.underlying_symbol_name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
