import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BillsTab } from '../components/Month/sections/BillsTab'
import { OverviewTab } from '../components/Month/sections/OverviewTab'
import { PlanTab } from '../components/Month/sections/PlanTab'
import { WealthTab } from '../components/Month/sections/WealthTab'
import { MonthTabNav } from '../components/Month/shared/MonthTabNav'
import { BankBalanceSetting } from '../components/Settings/BankBalanceSetting'
import { CurrencySetting } from '../components/Settings/CurrencySetting'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { QueryStatus } from '../components/ui/QueryStatus'
import { useConfirmDialog } from '../hooks/useConfirmDialog'
import { useMonthWorkspace } from '../hooks/useMonthWorkspace'

export function MonthPage() {
  const { t } = useTranslation()
  const { requestConfirm, confirmProps } = useConfirmDialog()
  const {
    year,
    month,
    valid,
    loading,
    error,
    hasData,
    monthRecord,
    currency,
    items,
    expenses,
    incomes,
    goals,
    tab,
    setTab,
    form,
    actions,
    kraken,
    netWorthCents,
    submitItem,
  } = useMonthWorkspace()

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 text-left sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/months"
            className="text-sm text-(--muted) underline-offset-2 hover:underline"
          >
            {t('common.backToHome')}
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">
            {monthRecord?.label ??
              (valid ? `${year}-${month}` : t('month.titleFallback'))}
          </h1>
        </div>
        {monthRecord ? (
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <CurrencySetting currency={currency} year={year} month={month} />
            <BankBalanceSetting
              monthId={monthRecord.id}
              bankBalanceCents={monthRecord.bankBalanceCents}
              year={year}
              month={month}
            />
          </div>
        ) : null}
      </header>

      <QueryStatus
        loading={loading}
        hasData={hasData}
        error={error}
        actionError={actions.formError}
        emptyMessage={
          !loading && hasData && !monthRecord ? t('month.notFound') : null
        }
      />

      {monthRecord ? (
        <>
          <MonthTabNav tab={tab} onChange={setTab} />

          <div
            role="tabpanel"
            aria-labelledby={`month-tab-${tab}`}
            className="flex flex-col gap-8"
          >
            {tab === 'overview' ? (
              <OverviewTab
                year={year}
                month={month}
                summary={monthRecord.summary}
                bankBalanceCents={monthRecord.bankBalanceCents}
                items={items}
                currency={currency}
                netWorthCents={netWorthCents}
                onOpenWealth={() => setTab('wealth')}
              />
            ) : null}

            {tab === 'plan' ? (
              <PlanTab
                currency={currency}
                items={items}
                expenses={expenses}
                incomes={incomes}
                formOpen={form.formOpen}
                editing={form.editing}
                submitting={actions.creating || actions.updating}
                onOpenAdd={form.openAdd}
                onCloseForm={form.closeForm}
                onSubmit={submitItem}
                onEdit={form.openEdit}
                onDelete={(item) => {
                  void (async () => {
                    const ok = await requestConfirm(
                      t('month.confirmDeleteItem', { name: item.name }),
                    )
                    if (ok) await actions.remove(item)
                  })()
                }}
                onToggleActive={(item) => void actions.toggleActive(item)}
              />
            ) : null}

            {tab === 'bills' ? (
              <BillsTab
                year={year}
                month={month}
                items={items}
                currency={currency}
                onTogglePaid={(item) => void actions.togglePaid(item)}
              />
            ) : null}

            {tab === 'wealth' ? (
              <WealthTab
                summary={monthRecord.summary}
                currency={currency}
                bankBalanceCents={monthRecord.bankBalanceCents}
                krakenBalance={kraken.displayKraken}
                krakenLoading={kraken.krakenLoading}
                krakenLive={kraken.live}
                onRefreshKraken={
                  kraken.refreshKraken
                    ? () => void kraken.refreshKraken?.()
                    : undefined
                }
                refreshingKraken={kraken.refreshingKraken}
                goals={goals}
                netWorthCents={netWorthCents}
                year={year}
                month={month}
              />
            ) : null}
          </div>
        </>
      ) : null}

      <ConfirmDialog {...confirmProps} />
    </div>
  )
}
