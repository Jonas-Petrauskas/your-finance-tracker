import { useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import { GoalsPanel } from '../components/GoalsPanel'
import { TemplatesPanel } from '../components/TemplatesPanel'
import { GET_HOME } from '../graphql/operations'
import type {
  Goal,
  KrakenBalance,
  MonthListItem,
  RecurringTemplate,
} from '../lib/types'

type SetupData = {
  months: MonthListItem[]
  settings: { currency: string }
  goals: Goal[]
  templates: RecurringTemplate[]
  krakenBalance: KrakenBalance
}

export function SetupPage() {
  const { data, loading, error } = useQuery<SetupData>(GET_HOME)

  const currency = data?.settings.currency ?? 'EUR'
  const goals = data?.goals ?? []
  const templates = data?.templates ?? []
  const months = data?.months ?? []
  const kraken = data?.krakenBalance
  const latestBank = months[0]?.bankBalanceCents ?? 0
  const netWorthCents =
    latestBank +
    (kraken && !kraken.error && currency === 'EUR' ? kraken.balanceCents : 0)

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="text-left">
        <Link
          to="/"
          className="text-sm text-(--muted) underline-offset-2 hover:underline"
        >
          ← All months
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">
          Setup
        </h1>
        <p className="mt-2 max-w-xl text-(--muted)">
          Templates seed new months. Goals track buffers against your net
          worth.
        </p>
      </header>

      {loading && !data ? <p className="text-(--muted)">Loading…</p> : null}
      {error ? (
        <p className="rounded-md border border-(--expense) bg-white px-3 py-2 text-(--expense)">
          Could not reach GraphQL. Is the server running on port 4000?
        </p>
      ) : null}

      {data ? (
        <>
          <TemplatesPanel templates={templates} currency={currency} />
          <GoalsPanel
            goals={goals}
            currency={currency}
            availableCents={netWorthCents}
          />
        </>
      ) : null}
    </div>
  )
}
