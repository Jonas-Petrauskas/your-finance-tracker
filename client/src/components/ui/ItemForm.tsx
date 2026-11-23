import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { amountToCents, centsToInput } from '../../lib/format'
import {
  categoriesForDirection,
  categoryLabel,
  defaultDirectionForCategory,
  type Category,
  type Direction,
  type ItemInput,
  type RecurringItem,
} from '../../lib/types'

type Props = {
  initial?: RecurringItem | null
  onSubmit: (input: ItemInput) => Promise<void>
  onCancel?: () => void
  submitting?: boolean
}

export function ItemForm({ initial, onSubmit, onCancel, submitting }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(
    initial ? centsToInput(initial.amountCents) : '',
  )
  const [direction, setDirection] = useState<Direction>(
    initial?.direction ?? 'EXPENSE',
  )
  const [category, setCategory] = useState<Category>(
    initial?.category ?? 'SUBSCRIPTION',
  )
  const [billingDay, setBillingDay] = useState(
    initial?.billingDay != null ? String(initial.billingDay) : '',
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [active, setActive] = useState(initial?.active ?? true)
  const [oneOff, setOneOff] = useState(initial?.oneOff ?? false)
  const [error, setError] = useState<string | null>(null)

  const categoryOptions = categoriesForDirection(direction)

  useEffect(() => {
    setName(initial?.name ?? '')
    setAmount(initial ? centsToInput(initial.amountCents) : '')
    setDirection(initial?.direction ?? 'EXPENSE')
    setCategory(initial?.category ?? 'SUBSCRIPTION')
    setBillingDay(initial?.billingDay != null ? String(initial.billingDay) : '')
    setNotes(initial?.notes ?? '')
    setActive(initial?.active ?? true)
    setOneOff(initial?.oneOff ?? false)
    setError(null)
  }, [initial])

  useEffect(() => {
    const allowed = categoriesForDirection(direction)
    if (!allowed.includes(category)) {
      setCategory(allowed[0]!)
    }
  }, [direction, category])

  return (
    <form
      className="surface-card grid gap-3 p-4 text-left"
      onSubmit={(event) => {
        event.preventDefault()
        const amountCents = amountToCents(amount)
        if (!name.trim()) {
          setError(t('errors.validation.nameRequired'))
          return
        }
        if (amountCents === null) {
          setError(t('errors.validation.positiveAmount'))
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
            setError(t('errors.validation.billingDayRange'))
            return
          }
        }
        setError(null)
        void onSubmit({
          name: name.trim(),
          amountCents,
          category,
          direction,
          billingDay: parsedBillingDay,
          notes: notes.trim() || null,
          active,
          paid: initial?.paid ?? false,
          oneOff,
        }).then(() => {
          if (!initial) {
            setName('')
            setAmount('')
            setBillingDay('')
            setNotes('')
            setActive(true)
            setOneOff(false)
          }
        })
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-(--ink)">
          {initial ? t('month.itemForm.editTitle') : t('month.itemForm.addTitle')}
        </h2>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-(--muted) underline"
          >
            {t('common.cancel')}
          </button>
        ) : null}
      </div>

      <label className="grid gap-1 text-sm">
        <span className="text-(--muted)">{t('common.fields.name')}</span>
        <input
          className="rounded-md border border-(--line) px-3 py-2"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('month.itemForm.namePlaceholder')}
          required
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-(--muted)">{t('common.fields.amount')}</span>
          <input
            className="rounded-md border border-(--line) px-3 py-2"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={t('month.itemForm.amountPlaceholder')}
            required
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-(--muted)">{t('common.fields.category')}</span>
          <select
            className="rounded-md border border-(--line) px-3 py-2"
            value={category}
            onChange={(event) => {
              const next = event.target.value as Category
              setCategory(next)
              if (!initial) setDirection(defaultDirectionForCategory(next))
            }}
          >
            {categoryOptions.map((key) => (
              <option key={key} value={key}>
                {categoryLabel(key)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="grid gap-2 text-sm">
        <legend className="text-(--muted)">{t('common.fields.direction')}</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="direction"
              checked={direction === 'EXPENSE'}
              onChange={() => {
                setDirection('EXPENSE')
                if (!categoriesForDirection('EXPENSE').includes(category)) {
                  setCategory('SUBSCRIPTION')
                }
              }}
            />
            {t('common.direction.expense')}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="direction"
              checked={direction === 'INCOME'}
              onChange={() => {
                setDirection('INCOME')
                if (!categoriesForDirection('INCOME').includes(category)) {
                  setCategory('GOVERNMENT')
                }
              }}
            />
            {t('common.direction.income')}
          </label>
        </div>
      </fieldset>

      <label className="grid gap-1 text-sm">
        <span className="text-(--muted)">
          {t('month.itemForm.billingDayLabel')}
        </span>
        <input
          className="rounded-md border border-(--line) px-3 py-2"
          inputMode="numeric"
          value={billingDay}
          onChange={(event) => setBillingDay(event.target.value)}
          placeholder={t('month.itemForm.billingDayPlaceholder')}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-(--muted)">{t('month.itemForm.notesLabel')}</span>
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
        {t('month.itemForm.activeHelp')}
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={oneOff}
          onChange={(event) => setOneOff(event.target.checked)}
        />
        {t('month.itemForm.oneOffHelp')}
      </label>

      {error ? <p className="text-sm text-(--expense)">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
      >
        {initial ? t('common.saveChanges') : t('month.itemForm.submitAdd')}
      </button>
    </form>
  )
}
