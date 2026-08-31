'use client';

import { AnalysisDashboard } from '@/components/analysis/analysis-dashboard';

/**
 * Deriv third-party analysis tool. Live tick streaming with last-digit,
 * even/odd, over/under and rise/fall analytics, plus real login + trading
 * across volatility, jump, forex and commodity markets. The WebSocket
 * connection and auth live in DerivWSProvider (see template-layout).
 */
export default function Page() {
  return <AnalysisDashboard />;
}
