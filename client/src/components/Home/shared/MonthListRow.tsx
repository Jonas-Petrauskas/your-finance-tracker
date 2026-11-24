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
    <li className="flex items-center gap-2.5">
      <Link
        to={`/months/${month.year}/${month.month}`}
        className="month-row group flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-(--line) px-4 py-4 shadow-[0_8px_24px_rgb(20_60_45_/_0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:shadow-[0_12px_28px_rgb(15_122_92_/_0.12)] sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="text-left">
          <p className="display text-lg font-semibold tracking-tight text-(--ink)">
            {month.label}
          </p>
          <p className="mt-1 text-sm text-(--muted)">
            {t('home.monthRow.bankSavings', {
              amount: formatMoney(month.bankBalanceCents, currency),
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm sm:justify-end">
          <span className="font-medium text-(--income)">
            {t('home.monthRow.in', {
              amount: formatMoney(month.summary.incomeCents, currency),
            })}
          </span>
          <span className="font-medium text-(--expense)">
            {t('home.monthRow.out', {
              amount: formatMoney(month.summary.expenseCents, currency),
            })}
          </span>
          <span
            className="font-semibold"
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
      <button
        type="button"
        onClick={() => onDelete(month)}
        className="month-row-delete shrink-0 rounded-2xl border border-(--expense-border) bg-(--expense-soft) p-3 text-(--expense) shadow-[0_6px_16px_rgb(214_69_58_/_0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd2cb] hover:shadow-[0_10px_22px_rgb(214_69_58_/_0.18)]"
        aria-label={deleteLabel}
        title={deleteLabel}
      >
        <TrashIcon />
      </button>
    </li>
  )
}
