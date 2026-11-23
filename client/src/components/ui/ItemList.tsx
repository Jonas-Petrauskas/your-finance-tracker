import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../lib/format'
import {
  categoryLabel,
  categoryOrderForItems,
  formatBillingDay,
  type Category,
  type RecurringItem,
} from '../../lib/types'

type Props = {
  title: string
  items: RecurringItem[]
  currency: string
  categoryOrder: Category[]
  onEdit: (item: RecurringItem) => void
  onDelete: (item: RecurringItem) => void
  onToggleActive: (item: RecurringItem) => void
}

export function ItemList({
  title,
  items,
  currency,
  categoryOrder,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const { t } = useTranslation()
  const ordered = categoryOrderForItems(items, categoryOrder)
  const grouped = ordered
    .map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0)

  if (items.length === 0) return null

  const isExpense = items[0]?.direction === 'EXPENSE'

  return (
    <section className="text-left">
      <h2
        className={`mb-3 text-lg font-bold ${
          isExpense ? 'text-(--expense)' : 'text-(--income)'
        }`}
      >
        {title}
      </h2>
      <div className="grid gap-4">
        {grouped.map((group) => (
          <div key={group.category}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-(--muted)">
              {categoryLabel(group.category)}
            </h3>
            <ul className="surface-card overflow-hidden">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className={`flex flex-col gap-2 border-b border-(--line) px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between ${
                    item.active ? '' : 'opacity-55'
                  }`}
                >
                  <div>
                    <p className="font-medium text-(--ink)">
                      {item.name}
                      {item.oneOff ? (
                        <span className="ml-2 rounded bg-(--warn-soft) px-1.5 py-0.5 text-xs font-medium text-amber-900">
                          {t('month.itemList.oneOff')}
                        </span>
                      ) : null}
                    </p>
                    {item.billingDay != null ? (
                      <p className="text-sm text-(--muted)">
                        {t('month.itemList.chargedOn', {
                          day: formatBillingDay(item.billingDay),
                        })}
                      </p>
                    ) : null}
                    {item.notes ? (
                      <p className="text-sm text-(--muted)">{item.notes}</p>
                    ) : null}
                    {!item.active ? (
                      <p className="text-xs text-(--muted)">
                        {t('month.itemList.disabled')}
                      </p>
                    ) : null}
                    {item.paid ? (
                      <p className="text-xs text-(--muted)">
                        {t('month.itemList.markedPaid')}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={`font-bold tabular-nums ${
                        isExpense ? 'text-(--expense)' : 'text-(--income)'
                      }`}
                    >
                      {formatMoney(item.amountCents, currency)}
                    </span>
                    <button
                      type="button"
                      className="rounded-md border border-(--line) bg-white px-2 py-1 text-xs"
                      onClick={() => onToggleActive(item)}
                    >
                      {item.active ? t('common.disable') : t('common.enable')}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-(--line) bg-white px-2 py-1 text-xs"
                      onClick={() => onEdit(item)}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-(--expense-border) bg-(--expense-soft) px-2 py-1 text-xs text-(--expense)"
                      onClick={() => onDelete(item)}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
