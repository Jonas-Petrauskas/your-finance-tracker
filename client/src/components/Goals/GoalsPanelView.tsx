import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useConfirmDialog } from '../../hooks/useConfirmDialog'
import { formatMoney } from '../../lib/format'
import type { Goal, GoalInput } from '../../lib/types'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Modal } from '../ui/Modal'
import { GoalForm } from './GoalForm'

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
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)

  const formOpen = manage && (showForm || editing != null)

  function openAdd() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(goal: Goal) {
    setEditing(goal)
    setShowForm(true)
  }

  function closeForm() {
    setEditing(null)
    setShowForm(false)
  }

  async function handleSubmit(input: GoalInput) {
    if (editing) {
      await onUpdate?.(editing.id, input)
    } else {
      await onCreate?.(input)
    }
    closeForm()
  }

  return (
    <section className="text-left">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="display text-lg font-semibold tracking-tight text-(--ink)">
            {t('month.goals.title')}
          </h2>
          <p className="mt-1 text-sm text-(--muted)">
            {t('month.goals.subtitle', {
              amount: formatMoney(availableCents, currency),
            })}
          </p>
        </div>
        {manage ? (
          <button
            type="button"
            onClick={openAdd}
            className="btn-primary px-4 py-2 text-sm"
          >
            {t('month.goals.addButton')}
          </button>
        ) : null}
      </div>

      <ul className="grid gap-3">
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
                      onClick={() => openEdit(goal)}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-(--line) px-2 py-1 text-(--expense)"
                      onClick={() => {
                        void (async () => {
                          const ok = await requestConfirm(
                            t('month.goals.confirmDelete', {
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
                {t('month.goals.progress', {
                  pct,
                  target: formatMoney(goal.targetCents, currency),
                })}
              </p>
            </li>
          )
        })}
        {goals.length === 0 ? (
          <li className="rounded-xl border border-dashed border-(--line) bg-white/70 px-4 py-8 text-center text-(--muted)">
            {t('month.goals.empty')}{' '}
            {manage ? (
              <button
                type="button"
                onClick={openAdd}
                className="text-(--accent) underline-offset-2 hover:underline"
              >
                {t('month.goals.emptyCta')}
              </button>
            ) : null}
          </li>
        ) : null}
      </ul>

      <Modal open={formOpen} onClose={closeForm}>
        <GoalForm
          key={editing?.id ?? 'create'}
          initial={editing}
          submitting={creating || updating}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      </Modal>

      <ConfirmDialog {...confirmProps} />
    </section>
  )
}
