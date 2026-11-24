import type { KrakenBalance, MonthlySummary } from '../../../lib/types'
import { BankBalanceSetting } from '../../Settings/BankBalanceSetting'
import { SummaryStrip } from '../../ui/SummaryStrip'

type Props = {
  summary: MonthlySummary
  currency: string
  monthId: string
  bankBalanceCents: number
  krakenBalance: KrakenBalance | null
  krakenLoading: boolean
  krakenLive: boolean
  onRefreshKraken?: () => void
  refreshingKraken: boolean
  year: number
  month: number
}

export function WealthTab({
  summary,
  currency,
  monthId,
  bankBalanceCents,
  krakenBalance,
  krakenLoading,
  krakenLive,
  onRefreshKraken,
  refreshingKraken,
  year,
  month,
}: Props) {
  return (
    <>
      <BankBalanceSetting
        monthId={monthId}
        bankBalanceCents={bankBalanceCents}
        year={year}
        month={month}
      />
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
    </>
  )
}
