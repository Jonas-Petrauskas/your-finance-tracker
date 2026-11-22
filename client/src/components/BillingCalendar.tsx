import { formatMoney } from '../lib/format'
import { buildBillingCalendar } from '../lib/runway'
import { formatBillingDay, type RecurringItem } from '../lib/types'

type Props = {
  year: number
  month: number
  items: RecurringItem[]
  currency: string
  onTogglePaid: (item: RecurringItem) => void
}

export function BillingCalendar({
  year,
  month,
  items,
  currency,
  onTogglePaid,
}: Props) {
  const entries = buildBillingCalendar(year, month, items)
  const undated = items.filter((item) => item.active && item.billingDay == null)
  const today = new Date()
  const isCurrent =
    today.getFullYear() === year && today.getMonth() + 1 === month
  const todayDay = isCurrent ? today.getDate() : null

  if (entries.length === 0 && undated.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-(--line) bg-white/70 px-4 py-6 text-left text-(--muted)">
        <h2 className="text-lg font-semibold text-(--ink)">Billing calendar</h2>
        <p className="mt-2 text-sm">
          Add a billing day on items to see when charges hit this month.
        </p>
      </section>
    )
  }

  return (
    <section className="text-left">
      <h2 className="mb-1 text-lg font-semibold text-(--ink)">
        Billing calendar
      </h2>
      <p className="mb-4 text-sm text-(--muted)">
        Mark bills paid when they clear. Unpaid expenses feed the runway total.
      </p>
      <div className="grid gap-3">
        {entries.map((entry) => {
          const past = todayDay != null && entry.day < todayDay
          return (
            <div
              key={entry.day}
              className={`surface-card px-4 py-3 ${
                todayDay === entry.day
                  ? 'border-(--left-border) ring-2 ring-(--left-soft)'
                  : ''
              } ${past ? 'opacity-70' : ''}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-(--ink)">
                  {formatBillingDay(entry.day)}
                  {todayDay === entry.day ? (
                    <span className="ml-2 rounded bg-(--left-soft) px-1.5 py-0.5 text-xs font-semibold text-(--left)">
                      today
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-(--muted)">
                  {formatMoney(
                    entry.items
                      .filter((item) => item.direction === 'EXPENSE')
                      .reduce((sum, item) => sum + item.amountCents, 0),
                    currency,
                  )}{' '}
                  out
                </p>
              </div>
              <ul className="grid gap-2">
                {entry.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span
                      className={
                        item.paid
                          ? 'text-(--muted) line-through'
                          : 'text-(--ink)'
                      }
                    >
                      {item.name}{' '}
                      <span className="text-(--muted)">
                        ({item.direction === 'INCOME' ? 'in' : 'out'}{' '}
                        {formatMoney(item.amountCents, currency)})
                      </span>
                    </span>
                    <button
                      type="button"
                      className={
                        item.paid
                          ? 'rounded-md border border-(--line) bg-white px-2 py-1 text-xs'
                          : 'rounded-md border border-(--income-border) bg-(--income-soft) px-2 py-1 text-xs font-medium text-(--income)'
                      }
                      onClick={() => onTogglePaid(item)}
                    >
                      {item.paid ? 'Mark unpaid' : 'Mark paid'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        {undated.length > 0 ? (
          <div className="surface-card px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-(--ink)">
              No billing day
            </p>
            <ul className="grid gap-2">
              {undated.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span
                    className={
                      item.paid
                        ? 'text-(--muted) line-through'
                        : 'text-(--ink)'
                    }
                  >
                    {item.name}{' '}
                    <span className="text-(--muted)">
                      ({formatMoney(item.amountCents, currency)})
                    </span>
                  </span>
                  <button
                    type="button"
                    className={
                      item.paid
                        ? 'rounded-md border border-(--line) bg-white px-2 py-1 text-xs'
                        : 'rounded-md border border-(--income-border) bg-(--income-soft) px-2 py-1 text-xs font-medium text-(--income)'
                    }
                    onClick={() => onTogglePaid(item)}
                  >
                    {item.paid ? 'Mark unpaid' : 'Mark paid'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
