import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { amountToCents, centsToInput, formatMoney } from '../../lib/format'
import {
  categoriesForDirection,
  categoryLabel,
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
  const { t } = useTranslation()
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
        setError(t('errors.validation.billingDayRangeShort'))
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
        {t('setup.templates.title')}
      </h2>
      <p className="mb-4 text-sm text-(--muted)">
        {t('setup.templates.description')}
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
                · {categoryLabel(template.category)} ·{' '}
                {formatMoney(template.amountCents, currency)}
              </span>
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-(--line) px-2 py-1 text-xs"
                onClick={() => setEditing(template)}
              >
                {t('common.edit')}
              </button>
              <button
                type="button"
                className="rounded-md border border-(--line) px-2 py-1 text-xs text-(--expense)"
                onClick={() => {
                  if (
                    window.confirm(
                      t('setup.templates.confirmDelete', {
                        name: template.name,
                      }),
                    )
                  ) {
                    void onDelete(template.id)
                  }
                }}
              >
                {t('common.delete')}
              </button>
            </span>
          </li>
        ))}
        {templates.length === 0 ? (
          <li className="text-sm text-(--muted)">
            {t('setup.templates.empty')}
          </li>
        ) : null}
      </ul>
      <form
        className="grid gap-2 rounded-xl border border-(--line) bg-(--panel) p-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <p className="text-sm font-medium text-(--ink)">
          {editing
            ? t('setup.templates.editHeading')
            : t('setup.templates.addHeading')}
        </p>
        <input
          className="rounded-md border border-(--line) px-3 py-2 text-sm"
          placeholder={t('common.fields.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            className="rounded-md border border-(--line) px-3 py-2 text-sm"
            placeholder={t('common.fields.amount')}
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
            <option value="EXPENSE">{t('common.direction.expense')}</option>
            <option value="INCOME">{t('common.direction.income')}</option>
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
                {categoryLabel(key)}
              </option>
            ))}
          </select>
        </div>
        <input
          className="rounded-md border border-(--line) px-3 py-2 text-sm"
          placeholder={t('setup.templates.billingDayPlaceholder')}
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
            {editing
              ? t('setup.templates.save')
              : t('setup.templates.submitAdd')}
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
              {t('common.cancel')}
            </button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
