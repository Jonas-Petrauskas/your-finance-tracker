import { formatMoney } from '../lib/format'
import { CATEGORY_LABELS, type Category, type RecurringItem } from '../lib/types'

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
  const grouped = categoryOrder
    .map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0)

  if (items.length === 0) {
    return null
  }

  return (
    <section className="text-left">
      <h2 className="mb-3 text-lg font-semibold text-(--ink)">{title}</h2>
      <div className="grid gap-4">
        {grouped.map((group) => (
          <div key={group.category}>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-(--muted)">
              {CATEGORY_LABELS[group.category]}
            </h3>
            <ul className="overflow-hidden rounded-xl border border-(--line) bg-(--panel)">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className={`flex flex-col gap-2 border-b border-(--line) px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between ${
                    item.active ? '' : 'opacity-55'
                  }`}
                >
                  <div>
                    <p className="font-medium text-(--ink)">{item.name}</p>
                    {item.notes ? (
                      <p className="text-sm text-(--muted)">{item.notes}</p>
                    ) : null}
                    {!item.active ? (
                      <p className="text-xs text-(--muted)">Paused</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="font-semibold tabular-nums">
                      {formatMoney(item.amountCents, currency)}
                    </span>
                    <button
                      type="button"
                      className="rounded-md border border-(--line) px-2 py-1 text-xs"
                      onClick={() => onToggleActive(item)}
                    >
                      {item.active ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-(--line) px-2 py-1 text-xs"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-(--line) px-2 py-1 text-xs text-(--expense)"
                      onClick={() => onDelete(item)}
                    >
                      Delete
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
