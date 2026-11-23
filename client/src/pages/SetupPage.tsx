import { Link } from 'react-router-dom'
import { GoalsPanel } from '../components/Goals/GoalsPanel'
import { TemplatesPanel } from '../components/Templates/TemplatesPanel'
import { QueryStatus } from '../components/ui/QueryStatus'
import { useSetupData } from '../hooks/useSetupData'

export function SetupPage() {
  const {
    currency,
    goals,
    templates,
    netWorthCents,
    loading,
    error,
    hasData,
  } = useSetupData()

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

      <QueryStatus loading={loading} hasData={hasData} error={error} />

      {hasData ? (
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
