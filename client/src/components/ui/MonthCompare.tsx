import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../lib/format'
import type { MonthListItem } from '../../lib/types'

type Props = {
  months: MonthListItem[]
  currency: string
}

export function MonthCompare({ months, currency }: Props) {
  const { t } = useTranslation()
  const ordered = [...months].sort((a, b) =>
    a.year === b.year ? a.month - b.month : a.year - b.year,
  )

  if (ordered.length < 2) {
    return (
      <section className="rounded-xl border border-dashed border-(--line) bg-white/70 px-4 py-6 text-left text-(--muted)">
        <h2 className="text-lg font-semibold text-(--ink)">
          {t('home.compare.title')}
        </h2>
        <p className="mt-2 text-sm">{t('home.compare.empty')}</p>
      </section>
    )
  }

  const maxExpense = Math.max(
    ...ordered.map((m) => m.summary.expenseCents),
    1,
  )

  return (
    <section className="text-left">
      <h2 className="mb-1 text-lg font-semibold text-(--ink)">
        {t('home.compare.title')}
      </h2>
      <p className="mb-4 text-sm text-(--muted)">{t('home.compare.hint')}</p>
      <ul className="grid gap-3">
        {ordered.map((month, index) => {
          const prev = index > 0 ? ordered[index - 1] : null
          const expenseDelta = prev
            ? month.summary.expenseCents - prev.summary.expenseCents
            : null
          const width = Math.round(
            (month.summary.expenseCents / maxExpense) * 100,
          )
          const signedDelta =
            expenseDelta != null
              ? `${expenseDelta > 0 ? '+' : ''}${formatMoney(expenseDelta, currency)}`
              : null
          return (
            <li key={month.id} className="surface-card px-4 py-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-(--ink)">{month.label}</p>
                <p className="text-sm text-(--muted)">
                  {t('home.compare.rowLeft', {
                    amount: formatMoney(month.summary.leftCents, currency),
                  })}
                  {signedDelta != null ? (
                    <span
                      className={
                        expenseDelta! > 0
                          ? ' text-(--expense)'
                          : expenseDelta! < 0
                            ? ' text-(--income)'
                            : ''
                      }
                    >
                      {t('home.compare.expenseDelta', { delta: signedDelta })}
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-(--expense-soft)">
                <div
                  className="bar-expense h-full rounded-full"
                  style={{ width: `${width}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-(--muted)">
                {t('home.compare.rowTotals', {
                  out: formatMoney(month.summary.expenseCents, currency),
                  in: formatMoney(month.summary.incomeCents, currency),
                })}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
