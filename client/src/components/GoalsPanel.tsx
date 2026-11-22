import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CREATE_GOAL,
  DELETE_GOAL,
  GET_HOME,
  GET_MONTH,
  UPDATE_GOAL,
} from '../graphql/operations'
import { amountToCents, centsToInput, formatMoney } from '../lib/format'
import type { Goal } from '../lib/types'

type Props = {
  goals: Goal[]
  currency: string
  availableCents: number
  year?: number
  month?: number
  /** When false, show progress only (edit on Setup). */
  manage?: boolean
}

export function GoalsPanel({
  goals,
  currency,
  availableCents,
  year,
  month,
  manage = true,
}: Props) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Goal | null>(null)

  const refetch =
    year != null && month != null
      ? [
          { query: GET_HOME },
          { query: GET_MONTH, variables: { year, month } },
        ]
      : [{ query: GET_HOME }]

  const [createGoal, { loading: creating }] = useMutation(CREATE_GOAL, {
    refetchQueries: refetch,
  })
  const [updateGoal, { loading: updating }] = useMutation(UPDATE_GOAL, {
    refetchQueries: refetch,
  })
  const [deleteGoal] = useMutation(DELETE_GOAL, { refetchQueries: refetch })

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const targetCents = amountToCents(target)
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (targetCents === null) {
      setError('Enter a positive target amount')
      return
    }
    setError(null)
    const input = { name: name.trim(), targetCents }
    if (editing) {
      await updateGoal({ variables: { id: editing.id, input } })
      setEditing(null)
    } else {
      await createGoal({ variables: { input } })
    }
    setName('')
    setTarget('')
  }

  return (
    <section className="text-left">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-(--ink)">
            Goals & buffers
          </h2>
          <p className="mt-1 text-sm text-(--muted)">
            Progress vs net worth now ({formatMoney(availableCents, currency)}
            ).
          </p>
        </div>
        {!manage ? (
          <Link
            to="/setup"
            className="text-sm text-(--accent) underline-offset-2 hover:underline"
          >
            Manage in Setup
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
            <li
              key={goal.id}
              className="surface-card px-4 py-3"
            >
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
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-(--line) px-2 py-1 text-(--expense)"
                      onClick={() => {
                        if (window.confirm(`Delete “${goal.name}”?`)) {
                          void deleteGoal({ variables: { id: goal.id } })
                        }
                      }}
                    >
                      Delete
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
                {pct}% of {formatMoney(goal.targetCents, currency)}
              </p>
            </li>
          )
        })}
        {goals.length === 0 ? (
          <li className="text-sm text-(--muted)">
            No goals yet.
            {!manage ? (
              <>
                {' '}
                <Link
                  to="/setup"
                  className="text-(--accent) underline-offset-2 hover:underline"
                >
                  Add one in Setup
                </Link>
              </>
            ) : null}
          </li>
        ) : null}
      </ul>
      {manage ? (
        <form
          className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]"
          onSubmit={handleSubmit}
        >
          <input
            className="rounded-md border border-(--line) px-3 py-2 text-sm"
            placeholder="Emergency fund"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-md border border-(--line) px-3 py-2 text-sm"
            placeholder="5000"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <button
            type="submit"
            disabled={creating || updating}
            className="btn-primary px-3 py-2 text-sm disabled:opacity-50"
          >
            {editing ? 'Save' : 'Add goal'}
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
              Cancel edit
            </button>
          ) : null}
          {error ? (
            <p className="text-sm text-(--expense) sm:col-span-3">{error}</p>
          ) : null}
        </form>
      ) : null}
    </section>
  )
}
