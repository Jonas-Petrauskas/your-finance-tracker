import { formatMoney } from '../lib/format'
import type { KrakenBalance, MonthlySummary } from '../lib/types'
import { KrakenBalanceCard } from './KrakenBalanceCard'

type Props = {
  summary: MonthlySummary
  currency: string
  bankBalanceCents: number
  krakenBalance?: KrakenBalance | null
  krakenLoading?: boolean
}

export function SummaryStrip({
  summary,
  currency,
  bankBalanceCents,
  krakenBalance,
  krakenLoading = false,
}: Props) {
  const leftNegative = summary.leftCents < 0

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <div className="rounded-xl border border-(--line) bg-(--panel) px-4 py-3 text-left">
        <p className="text-xs uppercase tracking-wide text-(--muted)">
          Income
        </p>
        <p className="mt-1 text-2xl font-semibold text-(--income)">
          {formatMoney(summary.incomeCents, currency)}
        </p>
      </div>
      <div className="rounded-xl border border-(--line) bg-(--panel) px-4 py-3 text-left">
        <p className="text-xs uppercase tracking-wide text-(--muted)">
          Expenses
        </p>
        <p className="mt-1 text-2xl font-semibold text-(--expense)">
          {formatMoney(summary.expenseCents, currency)}
        </p>
      </div>
      <div className="rounded-xl border border-(--line) bg-(--panel) px-4 py-3 text-left">
        <p className="text-xs uppercase tracking-wide text-(--muted)">
          Left this month
        </p>
        <p
          className="mt-1 text-2xl font-semibold"
          style={{ color: leftNegative ? 'var(--left-neg)' : 'var(--left)' }}
        >
          {formatMoney(summary.leftCents, currency)}
        </p>
      </div>
      <div className="rounded-xl border border-(--line) bg-(--panel) px-4 py-3 text-left">
        <p className="text-xs uppercase tracking-wide text-(--muted)">
          Bank savings
        </p>
        <p className="mt-1 text-2xl font-semibold text-(--ink)">
          {formatMoney(bankBalanceCents, currency)}
        </p>
      </div>
      <KrakenBalanceCard
        krakenBalance={krakenBalance}
        loading={krakenLoading}
      />
    </section>
  )
}
