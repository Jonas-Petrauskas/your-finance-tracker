import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { GoalsPanel } from '../components/Goals/GoalsPanel'
import { QueryStatus } from '../components/ui/QueryStatus'
import { useSetupData } from '../hooks/useSetupData'

export function SetupPage() {
  const { t } = useTranslation()
  const { currency, goals, netWorthCents, loading, error, hasData } =
    useSetupData()

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="text-left">
        <Link
          to="/months"
          className="text-sm text-(--muted) underline-offset-2 hover:underline"
        >
          {t('common.backToHome')}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">
          {t('setup.title')}
        </h1>
        <p className="mt-2 max-w-xl text-(--muted)">{t('setup.subtitle')}</p>
      </header>

      <QueryStatus loading={loading} hasData={hasData} error={error} />

      {hasData ? (
        <GoalsPanel
          goals={goals}
          currency={currency}
          availableCents={netWorthCents}
        />
      ) : null}
    </div>
  )
}
