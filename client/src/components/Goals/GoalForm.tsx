import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { amountToCents, centsToInput } from '../../lib/format'
import type { Goal, GoalInput } from '../../lib/types'

type Props = {
  initial?: Goal | null
  submitting?: boolean
  onSubmit: (input: GoalInput) => Promise<unknown>
  onCancel: () => void
}

export function GoalForm({ initial, submitting, onSubmit, onCancel }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(initial?.name ?? '')
  const [target, setTarget] = useState(
    initial ? centsToInput(initial.targetCents) : '',
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(initial?.name ?? '')
    setTarget(initial ? centsToInput(initial.targetCents) : '')
    setError(null)
  }, [initial])

  return (
    <form
      className="grid gap-3 p-5 text-left"
      onSubmit={(event) => {
        event.preventDefault()
        const targetCents = amountToCents(target)
        if (!name.trim()) {
          setError(t('errors.validation.nameRequired'))
          return
        }
        if (targetCents === null) {
          setError(t('errors.validation.positiveTarget'))
          return
        }
        setError(null)
        void onSubmit({ name: name.trim(), targetCents }).then(() => {
          if (!initial) {
            setName('')
            setTarget('')
          }
        })
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="display text-lg font-semibold tracking-tight text-(--ink)">
          {initial ? t('month.goals.editTitle') : t('month.goals.addTitle')}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-2 py-1 text-sm font-medium text-(--muted) hover:bg-(--accent-soft)/60 hover:text-(--ink)"
        >
          {t('common.cancel')}
        </button>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="text-(--muted)">{t('common.fields.name')}</span>
        <input
          className="rounded-md border border-(--line) px-3 py-2"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('month.goals.namePlaceholder')}
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-(--muted)">{t('common.fields.amount')}</span>
        <input
          className="rounded-md border border-(--line) px-3 py-2"
          inputMode="decimal"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          placeholder={t('month.goals.targetPlaceholder')}
          required
        />
      </label>

      {error ? <p className="text-sm text-(--expense)">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
      >
        {initial ? t('common.saveChanges') : t('month.goals.submitAdd')}
      </button>
    </form>
  )
}
