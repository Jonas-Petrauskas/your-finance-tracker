import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../../lib/format'
import type { MonthlySummary, RecurringItem } from '../../../lib/types'
import { SummaryStrip } from '../../ui/SummaryStrip'
import { WeeklyRunway } from '../../ui/WeeklyRunway'

type Props = {
  year: number
  month: number
  summary: MonthlySummary
  bankBalanceCents: number
  items: RecurringItem[]
  currency: string
  netWorthCents: number
  onOpenWealth: () => void
}

export function OverviewTab({
  year,
  month,
  summary,
  bankBalanceCents,
  items,
  currency,
  netWorthCents,
  onOpenWealth,
}: Props) {
  const { t } = useTranslation()

  return (
    <>
      <SummaryStrip
        variant="cashflow"
        summary={summary}
        currency={currency}
        bankBalanceCents={bankBalanceCents}
      />
      <WeeklyRunway
        year={year}
        month={month}
        leftCents={summary.leftCents}
        items={items}
        currency={currency}
      />
      <button
        type="button"
        onClick={onOpenWealth}
        className="tile tile-wealth w-full transition hover:brightness-[0.98]"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
          {t('month.overview.netWorth')}
        </p>
        <p className="mt-1 text-lg font-bold text-(--ink)">
          {formatMoney(netWorthCents, currency)}
          <span className="ml-2 text-sm font-semibold text-(--accent)">
            {t('month.overview.openWealth')}
          </span>
        </p>
      </button>
    </>
  )
}
