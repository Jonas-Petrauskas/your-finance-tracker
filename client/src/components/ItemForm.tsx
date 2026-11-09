import { useEffect, useState } from 'react'
import { centsToInput, eurosToCents } from '../lib/format'
import {
  CATEGORY_LABELS,
  defaultDirectionForCategory,
  type Category,
  type Direction,
  type ItemInput,
  type RecurringItem,
} from '../lib/types'

type Props = {
  initial?: RecurringItem | null
  onSubmit: (input: ItemInput) => Promise<void>
  onCancel?: () => void
  submitting?: boolean
}

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

export function ItemForm({ initial, onSubmit, onCancel, submitting }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(
    initial ? centsToInput(initial.amountCents) : '',
  )
  const [category, setCategory] = useState<Category>(
    initial?.category ?? 'SUBSCRIPTION',
  )
  const [direction, setDirection] = useState<Direction>(
    initial?.direction ?? 'EXPENSE',
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [active, setActive] = useState(initial?.active ?? true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(initial?.name ?? '')
    setAmount(initial ? centsToInput(initial.amountCents) : '')
    setCategory(initial?.category ?? 'SUBSCRIPTION')
    setDirection(initial?.direction ?? 'EXPENSE')
    setNotes(initial?.notes ?? '')
    setActive(initial?.active ?? true)
    setError(null)
  }, [initial])

  return (
    <form
      className="grid gap-3 rounded-xl border border-(--line) bg-(--panel) p-4 text-left"
      onSubmit={(event) => {
        event.preventDefault()
        const amountCents = eurosToCents(amount)
        if (!name.trim()) {
          setError('Name is required')
          return
        }
        if (amountCents === null) {
          setError('Enter a positive amount')
          return
        }
        setError(null)
        void onSubmit({
          name: name.trim(),
          amountCents,
          category,
          direction,
          notes: notes.trim() || null,
          active,
        })
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-(--ink)">
          {initial ? 'Edit item' : 'Add monthly item'}
        </h2>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-(--muted) underline"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <label className="grid gap-1 text-sm">
        <span className="text-(--muted)">Name</span>
        <input
          className="rounded-md border border-(--line) px-3 py-2"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Rent, Netflix, child benefit…"
          required
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-(--muted)">Amount (monthly)</span>
          <input
            className="rounded-md border border-(--line) px-3 py-2"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="120.00"
            required
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-(--muted)">Category</span>
          <select
            className="rounded-md border border-(--line) px-3 py-2"
            value={category}
            onChange={(event) => {
              const next = event.target.value as Category
              setCategory(next)
              if (!initial) {
                setDirection(defaultDirectionForCategory(next))
              }
            }}
          >
            {ALL_CATEGORIES.map((key) => (
              <option key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="grid gap-2 text-sm">
        <legend className="text-(--muted)">Direction</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="direction"
              checked={direction === 'EXPENSE'}
              onChange={() => setDirection('EXPENSE')}
            />
            Expense
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="direction"
              checked={direction === 'INCOME'}
              onChange={() => setDirection('INCOME')}
            />
            Income
          </label>
        </div>
      </fieldset>

      <label className="grid gap-1 text-sm">
        <span className="text-(--muted)">Notes (optional)</span>
        <textarea
          className="min-h-16 rounded-md border border-(--line) px-3 py-2"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
        />
        Active (counts toward monthly totals)
      </label>

      {error ? <p className="text-sm text-(--expense)">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {initial ? 'Save changes' : 'Add item'}
      </button>
    </form>
  )
}
