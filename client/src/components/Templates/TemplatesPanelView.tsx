import { useEffect, useState } from 'react'
import { amountToCents, centsToInput, formatMoney } from '../../lib/format'
import {
  CATEGORY_LABELS,
  categoriesForDirection,
  defaultDirectionForCategory,
  type Category,
  type Direction,
  type RecurringTemplate,
  type TemplateInput,
} from '../../lib/types'

type Props = {
  templates: RecurringTemplate[]
  currency: string
  creating?: boolean
  updating?: boolean
  onCreate: (input: TemplateInput) => Promise<unknown>
  onUpdate: (id: string, input: TemplateInput) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}

export function TemplatesPanelView({
  templates,
  currency,
  creating = false,
  updating = false,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState<RecurringTemplate | null>(null)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<Direction>('EXPENSE')
  const [category, setCategory] = useState<Category>('SUBSCRIPTION')
  const [billingDay, setBillingDay] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!editing) return
    setName(editing.name)
    setAmount(centsToInput(editing.amountCents))
    setDirection(editing.direction)
    setCategory(editing.category)
    setBillingDay(
      editing.billingDay != null ? String(editing.billingDay) : '',
    )
  }, [editing])

  const categoryOptions = categoriesForDirection(direction)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const amountCents = amountToCents(amount)
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (amountCents === null) {
      setError('Enter a positive amount')
      return
    }
    let parsedBillingDay: number | null = null
    if (billingDay.trim()) {
      parsedBillingDay = Number(billingDay)
      if (
        !Number.isInteger(parsedBillingDay) ||
        parsedBillingDay < 1 ||
        parsedBillingDay > 31
      ) {
        setError('Billing day must be 1–31')
        return
      }
    }
    setError(null)
    const input: TemplateInput = {
      name: name.trim(),
      amountCents,
      direction,
      category,
      billingDay: parsedBillingDay,
      active: true,
    }
    if (editing) {
      await onUpdate(editing.id, input)
      setEditing(null)
    } else {
      await onCreate(input)
    }
    setName('')
    setAmount('')
    setBillingDay('')
  }

  return (
    <section className="text-left">
      <h2 className="mb-1 text-lg font-semibold text-(--ink)">
        Recurring templates
      </h2>
      <p className="mb-4 text-sm text-(--muted)">
        When templates exist, “Add next month” copies from here instead of the
        previous month. One-offs never copy.
      </p>
      <ul className="mb-4 grid gap-2">
        {templates.map((template) => (
          <li
            key={template.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-(--line) bg-(--panel) px-4 py-3 text-sm"
          >
            <span>
              <span className="font-medium text-(--ink)">{template.name}</span>
              <span className="text-(--muted)">
                {' '}
                · {CATEGORY_LABELS[template.category]} ·{' '}
                {formatMoney(template.amountCents, currency)}
              </span>
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-(--line) px-2 py-1 text-xs"
                onClick={() => setEditing(template)}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-md border border-(--line) px-2 py-1 text-xs text-(--expense)"
                onClick={() => {
                  if (window.confirm(`Delete template “${template.name}”?`)) {
                    void onDelete(template.id)
                  }
                }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
        {templates.length === 0 ? (
          <li className="text-sm text-(--muted)">
            No templates yet — new months still copy from the previous month.
          </li>
        ) : null}
      </ul>
      <form
        className="grid gap-2 rounded-xl border border-(--line) bg-(--panel) p-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <p className="text-sm font-medium text-(--ink)">
          {editing ? 'Edit template' : 'Add template'}
        </p>
        <input
          className="rounded-md border border-(--line) px-3 py-2 text-sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            className="rounded-md border border-(--line) px-3 py-2 text-sm"
            placeholder="Amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select
            className="rounded-md border border-(--line) px-3 py-2 text-sm"
            value={direction}
            onChange={(e) => {
              const next = e.target.value as Direction
              setDirection(next)
              const allowed = categoriesForDirection(next)
              if (!allowed.includes(category)) setCategory(allowed[0]!)
            }}
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          <select
            className="rounded-md border border-(--line) px-3 py-2 text-sm"
            value={category}
            onChange={(e) => {
              const next = e.target.value as Category
              setCategory(next)
              setDirection(defaultDirectionForCategory(next))
            }}
          >
            {categoryOptions.map((key) => (
              <option key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <input
          className="rounded-md border border-(--line) px-3 py-2 text-sm"
          placeholder="Billing day (optional)"
          inputMode="numeric"
          value={billingDay}
          onChange={(e) => setBillingDay(e.target.value)}
        />
        {error ? <p className="text-sm text-(--expense)">{error}</p> : null}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={creating || updating}
            className="btn-primary px-3 py-2 text-sm disabled:opacity-50"
          >
            {editing ? 'Save template' : 'Add template'}
          </button>
          {editing ? (
            <button
              type="button"
              className="text-sm text-(--muted) underline"
              onClick={() => {
                setEditing(null)
                setName('')
                setAmount('')
                setBillingDay('')
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
