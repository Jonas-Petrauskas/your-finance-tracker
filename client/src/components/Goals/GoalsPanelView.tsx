import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useConfirmDialog } from '../../hooks/useConfirmDialog'
import { amountToCents, centsToInput, formatMoney } from '../../lib/format'
import type { Goal, GoalInput } from '../../lib/types'

type Props = {
  goals: Goal[]
  currency: string
  availableCents: number
  manage?: boolean
  creating?: boolean
  updating?: boolean
  onCreate?: (input: GoalInput) => Promise<unknown>
  onUpdate?: (id: string, input: GoalInput) => Promise<unknown>
  onDelete?: (id: string) => Promise<unknown>
}

export function GoalsPanelView({
  goals,
  currency,
  availableCents,
  manage = true,
  creating = false,
  updating = false,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const { t } = useTranslation()
  const { requestConfirm, confirmProps } = useConfirmDialog()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Goal | null>(null)

  async function handleSubmit(event: React.FormEvent) {
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
    const input = { name: name.trim(), targetCents }
    if (editing) {
      await onUpdate?.(editing.id, input)
      setEditing(null)
    } else {
      await onCreate?.(input)
    }
    setName('')
    setTarget('')
  }

  return (
    <section className="text-left">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-(--ink)">
            {t('setup.goals.title')}
          </h2>
          <p className="mt-1 text-sm text-(--muted)">
            {t('setup.goals.subtitle', {
              amount: formatMoney(availableCents, currency),
            })}
          </p>
        </div>
        {!manage ? (
          <Link
            to="/setup"
            className="text-sm text-(--accent) underline-offset-2 hover:underline"
          >
            {t('month.goals.manageInSetup')}
          </Link>
        ) : null}
      </div>
      <ul className="mb-4 grid gap-3">
        {goals.map((goal) => {
          const pct = Math.min(
            100,
            Math.round((availableCents / Math.max(goal.targetCents, 1)) * 100),
          )
          return (
            <li key={goal.id} className="surface-card px-4 py-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-(--ink)">{goal.name}</p>
                {manage ? (
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      className="rounded-md border border-(--line) px-2 py-1"
                      onClick={() => {
                        setEditing(goal)
                        setName(goal.name)
                        setTarget(centsToInput(goal.targetCents))
                      }}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-(--line) px-2 py-1 text-(--expense)"
                      onClick={() => {
                        void (async () => {
                          const ok = await requestConfirm(
                            t('setup.goals.confirmDelete', {
                              name: goal.name,
                            }),
                          )
                          if (ok) await onDelete?.(goal.id)
                        })()
                      }}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-(--accent-soft)">
                <div
                  className="bar-goal h-full rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-(--muted)">
                {t('setup.goals.progress', {
                  pct,
                  target: formatMoney(goal.targetCents, currency),
                })}
              </p>
            </li>
          )
        })}
        {goals.length === 0 ? (
          <li className="text-sm text-(--muted)">
            {t('setup.goals.empty')}
            {!manage ? (
              <>
                {' '}
                <Link
                  to="/setup"
                  className="text-(--accent) underline-offset-2 hover:underline"
                >
                  {t('month.goals.addInSetup')}
                </Link>
              </>
            ) : null}
          </li>
        ) : null}
      </ul>
      {manage ? (
        <form
          className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <input
            className="rounded-md border border-(--line) px-3 py-2 text-sm"
            placeholder={t('setup.goals.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-md border border-(--line) px-3 py-2 text-sm"
            placeholder={t('setup.goals.targetPlaceholder')}
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <button
            type="submit"
            disabled={creating || updating}
            className="btn-primary px-3 py-2 text-sm disabled:opacity-50"
          >
            {editing ? t('common.save') : t('setup.goals.submitAdd')}
          </button>
          {editing ? (
            <button
              type="button"
              className="text-sm text-(--muted) underline sm:col-span-3"
              onClick={() => {
                setEditing(null)
                setName('')
                setTarget('')
              }}
            >
              {t('setup.goals.cancelEdit')}
            </button>
          ) : null}
          {error ? (
            <p className="text-sm text-(--expense) sm:col-span-3">{error}</p>
          ) : null}
        </form>
      ) : null}

      <ConfirmDialog {...confirmProps} />
    </section>
  )
}
