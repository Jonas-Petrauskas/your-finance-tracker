import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../lib/format'
import { computeRunway } from '../../lib/runway'
import type { RecurringItem } from '../../lib/types'

type Props = {
  year: number
  month: number
  leftCents: number
  items: RecurringItem[]
  currency: string
}

export function WeeklyRunway({
  year,
  month,
  leftCents,
  items,
  currency,
}: Props) {
  const { t } = useTranslation()
  const runway = computeRunway(year, month, leftCents, items)
  const leftNegative = leftCents < 0

  return (
    <section className="surface-card px-4 py-4 text-left">
      <h2 className="text-lg font-bold text-(--ink)">{t('month.runway.title')}</h2>
      <p className="mt-1 text-sm text-(--muted)">
        {t('month.runway.intro', { count: runway.daysRemaining })}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className={`tile ${leftNegative ? 'tile-left-neg' : 'tile-left'}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted)">
            {t('month.runway.perDay')}
          </p>
          <p
            className="mt-1 text-xl font-bold"
            style={{ color: leftNegative ? 'var(--left-neg)' : 'var(--left)' }}
          >
            {formatMoney(runway.dailyBudgetCents, currency)}
          </p>
        </div>
        <div className={`tile ${leftNegative ? 'tile-left-neg' : 'tile-left'}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted)">
            {t('month.runway.perWeek')}
          </p>
          <p
            className="mt-1 text-xl font-bold"
            style={{ color: leftNegative ? 'var(--left-neg)' : 'var(--left)' }}
          >
            {formatMoney(runway.weeklyBudgetCents, currency)}
          </p>
        </div>
        <div className="tile tile-expense">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted)">
            {t('month.runway.unpaidExpenses')}
          </p>
          <p className="mt-1 text-xl font-bold text-(--expense)">
            {formatMoney(runway.unpaidExpenseCents, currency)}
          </p>
        </div>
      </div>
    </section>
  )
}
