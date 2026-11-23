import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatMoney } from '../../../lib/format'
import type { MonthListItem } from '../../../lib/types'
import { TrashIcon } from './TrashIcon'

type Props = {
  month: MonthListItem
  currency: string
  onDelete: (month: MonthListItem) => void
}

export function MonthListRow({ month, currency, onDelete }: Props) {
  const { t } = useTranslation()
  const leftNegative = month.summary.leftCents < 0
  const deleteLabel = t('home.monthRow.deleteAria', { label: month.label })

  return (
    <li className="month-row flex items-stretch gap-2 rounded-xl border border-(--line) shadow-sm transition hover:border-(--accent)">
      <Link
        to={`/months/${month.year}/${month.month}`}
        className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="text-left">
          <p className="text-lg font-semibold text-(--ink)">{month.label}</p>
          <p className="mt-1 text-sm text-(--muted)">
            {t('home.monthRow.bankSavings', {
              amount: formatMoney(month.bankBalanceCents, currency),
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm sm:justify-end">
          <span className="text-(--income)">
            {t('home.monthRow.in', {
              amount: formatMoney(month.summary.incomeCents, currency),
            })}
          </span>
          <span className="text-(--expense)">
            {t('home.monthRow.out', {
              amount: formatMoney(month.summary.expenseCents, currency),
            })}
          </span>
          <span
            className="font-medium"
            style={{
              color: leftNegative ? 'var(--left-neg)' : 'var(--left)',
            }}
          >
            {t('home.monthRow.left', {
              amount: formatMoney(month.summary.leftCents, currency),
            })}
          </span>
        </div>
      </Link>
      <div className="flex items-center border-l border-(--line) px-2">
        <button
          type="button"
          onClick={() => onDelete(month)}
          className="rounded-md p-2 text-(--expense) hover:bg-red-50"
          aria-label={deleteLabel}
          title={deleteLabel}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  )
}
