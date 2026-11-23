import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { MonthList } from '../components/Home/sections/MonthList'
import { MonthCompare } from '../components/ui/MonthCompare'
import { QueryStatus } from '../components/ui/QueryStatus'
import { useHomeMonths } from '../hooks/useHomeMonths'

export function HomePage() {
  const { t } = useTranslation()
  const {
    months,
    currency,
    loading,
    error,
    hasData,
    actionError,
    creating,
    addNextMonth,
    removeMonth,
  } = useHomeMonths()

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 text-left sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-(--muted)">
            {t('home.eyebrow')}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">
            {t('home.title')}
          </h1>
          <p className="mt-2 max-w-xl text-(--muted)">{t('home.subtitle')}</p>
          <Link
            to="/setup"
            className="mt-3 inline-block text-sm text-(--accent) underline-offset-2 hover:underline"
          >
            {t('home.setupLink')}
          </Link>
        </div>
        <button
          type="button"
          disabled={creating}
          onClick={() => void addNextMonth()}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          {creating ? t('home.addingNextMonth') : t('home.addNextMonth')}
        </button>
      </header>

      <QueryStatus
        loading={loading}
        hasData={hasData}
        error={error}
        actionError={actionError}
      />

      {hasData && months.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--line) bg-white/70 px-4 py-8 text-center text-(--muted)">
          {t('home.emptyMonths')}
        </div>
      ) : null}

      <MonthList
        months={months}
        currency={currency}
        onDelete={(month) => void removeMonth(month)}
      />

      {hasData ? <MonthCompare months={months} currency={currency} /> : null}
    </div>
  )
}
