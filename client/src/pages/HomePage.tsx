import { useMutation, useQuery } from '@apollo/client'
import { Link, useNavigate } from 'react-router-dom'
import {
  CREATE_NEXT_MONTH,
  DELETE_MONTH,
  GET_HOME,
} from '../graphql/operations'
import { formatMoney } from '../lib/format'
import type { MonthListItem } from '../lib/types'

type HomeData = {
  months: MonthListItem[]
  settings: { currency: string }
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { data, loading, error } = useQuery<HomeData>(GET_HOME)
  const [createNextMonth, { loading: creating }] = useMutation(CREATE_NEXT_MONTH, {
    refetchQueries: [{ query: GET_HOME }],
  })
  const [deleteMonth] = useMutation(DELETE_MONTH, {
    refetchQueries: [{ query: GET_HOME }],
  })

  const currency = data?.settings.currency ?? 'EUR'
  const months = data?.months ?? []

  async function handleAddNextMonth() {
    const result = await createNextMonth()
    const created = result.data?.createNextMonth as MonthListItem | undefined
    if (created) {
      navigate(`/months/${created.year}/${created.month}`)
    }
  }

  async function handleDeleteMonth(month: MonthListItem) {
    if (
      !window.confirm(
        `Delete “${month.label}” and all of its items? This cannot be undone.`,
      )
    ) {
      return
    }
    await deleteMonth({ variables: { id: month.id } })
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 text-left sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-(--muted)">
            Personal money
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">
            Monthly spending
          </h1>
          <p className="mt-2 max-w-xl text-(--muted)">
            Open a month to review income, expenses, and bank savings. Add the
            next month when you are ready — recurring items copy over, and you
            can disable anything you no longer need.
          </p>
        </div>
        <button
          type="button"
          disabled={creating}
          onClick={() => void handleAddNextMonth()}
          className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {creating ? 'Adding…' : 'Add next month'}
        </button>
      </header>

      {loading && !data ? (
        <p className="text-(--muted)">Loading…</p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-(--expense) bg-white px-3 py-2 text-(--expense)">
          Could not reach GraphQL. Is the server running on port 4000?
        </p>
      ) : null}

      {data && months.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--line) bg-white/70 px-4 py-8 text-center text-(--muted)">
          No months yet. Click “Add next month” to start tracking.
        </div>
      ) : null}

      {months.length > 0 ? (
        <ul className="grid gap-3">
          {months.map((month) => {
            const leftNegative = month.summary.leftCents < 0
            return (
              <li
                key={month.id}
                className="flex items-stretch gap-2 rounded-xl border border-(--line) bg-(--panel) transition hover:border-(--accent)"
              >
                <Link
                  to={`/months/${month.year}/${month.month}`}
                  className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-left">
                    <p className="text-lg font-semibold text-(--ink)">
                      {month.label}
                    </p>
                    <p className="mt-1 text-sm text-(--muted)">
                      Bank savings{' '}
                      {formatMoney(month.bankBalanceCents, currency)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm sm:justify-end">
                    <span className="text-(--income)">
                      In {formatMoney(month.summary.incomeCents, currency)}
                    </span>
                    <span className="text-(--expense)">
                      Out {formatMoney(month.summary.expenseCents, currency)}
                    </span>
                    <span
                      className="font-medium"
                      style={{
                        color: leftNegative
                          ? 'var(--left-neg)'
                          : 'var(--left)',
                      }}
                    >
                      Left {formatMoney(month.summary.leftCents, currency)}
                    </span>
                  </div>
                </Link>
                <div className="flex items-center border-l border-(--line) px-2">
                  <button
                    type="button"
                    onClick={() => void handleDeleteMonth(month)}
                    className="rounded-md p-2 text-(--expense) hover:bg-red-50"
                    aria-label={`Delete ${month.label}`}
                    title={`Delete ${month.label}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
