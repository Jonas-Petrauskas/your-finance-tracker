import type { Goal, KrakenBalance, MonthlySummary } from '../../../lib/types'
import { GoalsPanel } from '../../Goals/GoalsPanel'
import { SummaryStrip } from '../../ui/SummaryStrip'

type Props = {
  summary: MonthlySummary
  currency: string
  bankBalanceCents: number
  krakenBalance: KrakenBalance | null
  krakenLoading: boolean
  krakenLive: boolean
  onRefreshKraken?: () => void
  refreshingKraken: boolean
  goals: Goal[]
  netWorthCents: number
  year: number
  month: number
}

export function WealthTab({
  summary,
  currency,
  bankBalanceCents,
  krakenBalance,
  krakenLoading,
  krakenLive,
  onRefreshKraken,
  refreshingKraken,
  goals,
  netWorthCents,
  year,
  month,
}: Props) {
  return (
    <>
      <SummaryStrip
        variant="wealth"
        summary={summary}
        currency={currency}
        bankBalanceCents={bankBalanceCents}
        krakenBalance={krakenBalance}
        krakenLoading={krakenLoading}
        krakenLive={krakenLive}
        onRefreshKraken={onRefreshKraken}
        refreshingKraken={refreshingKraken}
      />
      <GoalsPanel
        goals={goals}
        currency={currency}
        availableCents={netWorthCents}
        year={year}
        month={month}
        manage={false}
      />
    </>
  )
}
