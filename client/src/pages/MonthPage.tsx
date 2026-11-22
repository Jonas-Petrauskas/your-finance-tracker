import { useMutation, useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BankBalanceSetting } from '../components/BankBalanceSetting'
import { BillingCalendar } from '../components/BillingCalendar'
import { CurrencySetting } from '../components/CurrencySetting'
import { GoalsPanel } from '../components/GoalsPanel'
import { ItemForm } from '../components/ItemForm'
import { ItemList } from '../components/ItemList'
import { SummaryStrip } from '../components/SummaryStrip'
import { WeeklyRunway } from '../components/WeeklyRunway'
import {
  CREATE_ITEM,
  DELETE_ITEM,
  GET_KRAKEN_BALANCE,
  GET_MONTH,
  SET_ITEM_PAID,
  UPDATE_ITEM,
} from '../graphql/operations'
import { formatMoney, graphqlErrorMessage } from '../lib/format'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Goal,
  type ItemInput,
  type KrakenBalance,
  type Month,
  type RecurringItem,
} from '../lib/types'

type MonthData = {
  monthByDate: Month | null
  settings: { currency: string }
  goals: Goal[]
}

type KrakenData = {
  krakenBalance: KrakenBalance
}

type MonthTab = 'overview' | 'plan' | 'bills' | 'wealth'

const TABS: { id: MonthTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'plan', label: 'Plan' },
  { id: 'bills', label: 'Bills' },
  { id: 'wealth', label: 'Wealth' },
]

export function MonthPage() {
  const params = useParams()
  const year = Number(params.year)
  const month = Number(params.month)
  const valid = Number.isInteger(year) && Number.isInteger(month)

  const { data, loading, error } = useQuery<MonthData>(GET_MONTH, {
    variables: { year, month },
    skip: !valid,
  })
  const monthRecordPreview = data?.monthByDate ?? null
  const useLiveKraken = !monthRecordPreview?.krakenSnapshottedAt

  const {
    data: krakenData,
    loading: krakenLoading,
    refetch: refetchKraken,
  } = useQuery<KrakenData>(GET_KRAKEN_BALANCE, {
    variables: { forceRefresh: false },
    skip: !valid || !useLiveKraken,
  })
  const [tab, setTab] = useState<MonthTab>('overview')
  const [editing, setEditing] = useState<RecurringItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [refreshingKraken, setRefreshingKraken] = useState(false)

  const monthRecord = data?.monthByDate ?? null
  const refetchMonth = {
    query: GET_MONTH,
    variables: { year, month },
  }

  const [createItem, { loading: creating }] = useMutation(CREATE_ITEM, {
    refetchQueries: [refetchMonth],
  })
  const [updateItem, { loading: updating }] = useMutation(UPDATE_ITEM, {
    refetchQueries: [refetchMonth],
  })
  const [deleteItem] = useMutation(DELETE_ITEM, {
    refetchQueries: [refetchMonth],
  })
  const [setItemPaid] = useMutation(SET_ITEM_PAID, {
    refetchQueries: [refetchMonth],
  })

  const currency = data?.settings.currency ?? 'EUR'
  const items = monthRecord?.items ?? []
  const expenses = items.filter((item) => item.direction === 'EXPENSE')
  const incomes = items.filter((item) => item.direction === 'INCOME')
  const goals = data?.goals ?? []

  const displayKraken: KrakenBalance | null = useMemo(() => {
    if (!monthRecord) return krakenData?.krakenBalance ?? null
    if (
      monthRecord.krakenSnapshottedAt &&
      monthRecord.krakenBalanceCents != null
    ) {
      return {
        balanceCents: monthRecord.krakenBalanceCents,
        earnCents: monthRecord.krakenEarnCents ?? 0,
        spotCents: monthRecord.krakenSpotCents ?? 0,
        currency: 'EUR',
        configured: true,
        error: null,
        updatedAt: monthRecord.krakenSnapshottedAt,
        cached: false,
      }
    }
    return krakenData?.krakenBalance ?? null
  }, [monthRecord, krakenData])

  const netWorthCents =
    (monthRecord?.bankBalanceCents ?? 0) +
    (displayKraken && !displayKraken.error && currency === 'EUR'
      ? displayKraken.balanceCents
      : 0)

  const formOpen = showForm || editing != null

  function openAdd() {
    setEditing(null)
    setShowForm(true)
    setTab('plan')
  }

  function openEdit(item: RecurringItem) {
    setEditing(item)
    setShowForm(true)
    setTab('plan')
  }

  function closeForm() {
    setEditing(null)
    setShowForm(false)
  }

  async function handleCreate(input: ItemInput) {
    if (!monthRecord) return
    try {
      setFormError(null)
      await createItem({ variables: { monthId: monthRecord.id, input } })
      setShowForm(false)
    } catch (err) {
      setFormError(graphqlErrorMessage(err, 'Could not create item'))
    }
  }

  async function handleUpdate(input: ItemInput) {
    if (!editing) return
    try {
      setFormError(null)
      await updateItem({ variables: { id: editing.id, input } })
      closeForm()
    } catch (err) {
      setFormError(graphqlErrorMessage(err, 'Could not update item'))
    }
  }

  async function handleToggleActive(item: RecurringItem) {
    try {
      setFormError(null)
      await updateItem({
        variables: {
          id: item.id,
          input: {
            name: item.name,
            amountCents: item.amountCents,
            direction: item.direction,
            category: item.category,
            billingDay: item.billingDay,
            notes: item.notes,
            active: !item.active,
            paid: item.paid,
            oneOff: item.oneOff,
          },
        },
      })
    } catch (err) {
      setFormError(graphqlErrorMessage(err, 'Could not update item'))
    }
  }

  async function handleTogglePaid(item: RecurringItem) {
    try {
      setFormError(null)
      await setItemPaid({ variables: { id: item.id, paid: !item.paid } })
    } catch (err) {
      setFormError(graphqlErrorMessage(err, 'Could not update paid status'))
    }
  }

  async function handleDelete(item: RecurringItem) {
    if (!window.confirm(`Delete “${item.name}”?`)) return
    try {
      setFormError(null)
      await deleteItem({ variables: { id: item.id } })
      if (editing?.id === item.id) closeForm()
    } catch (err) {
      setFormError(graphqlErrorMessage(err, 'Could not delete item'))
    }
  }

  async function handleRefreshKraken() {
    setRefreshingKraken(true)
    try {
      await refetchKraken({ forceRefresh: true })
    } finally {
      setRefreshingKraken(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 text-left sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/"
            className="text-sm text-(--muted) underline-offset-2 hover:underline"
          >
            ← All months
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">
            {monthRecord?.label ?? (valid ? `${year}-${month}` : 'Month')}
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

      {loading && !data ? <p className="text-(--muted)">Loading…</p> : null}
      {error ? (
        <p className="rounded-md border border-(--expense) bg-white px-3 py-2 text-(--expense)">
          Could not reach GraphQL. Is the server running on port 4000?
        </p>
      ) : null}
      {formError ? (
        <p className="rounded-md border border-(--expense) bg-white px-3 py-2 text-(--expense)">
          {formError}
        </p>
      ) : null}
      {!loading && data && !monthRecord ? (
        <p className="rounded-md border border-(--line) bg-white px-3 py-2 text-(--muted)">
          That month does not exist yet. Go back and add the next month from the
          home page.
        </p>
      ) : null}

      {monthRecord ? (
        <>
          <nav
            className="sticky top-0 z-10 -mx-4 border-b border-(--line) bg-white/75 px-4 backdrop-blur-md sm:-mx-6 sm:px-6"
            aria-label="Month sections"
          >
            <div role="tablist" className="flex gap-1 overflow-x-auto py-2">
              {TABS.map((item) => {
                const selected = tab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`month-tab-${item.id}`}
                    onClick={() => setTab(item.id)}
                    className={
                      selected
                        ? 'tab-active shrink-0 rounded-lg px-3 py-2 text-sm font-semibold'
                        : 'shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-(--muted) hover:bg-white/80 hover:text-(--ink)'
                    }
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </nav>

          <div
            role="tabpanel"
            aria-labelledby={`month-tab-${tab}`}
            className="flex flex-col gap-8"
          >
            {tab === 'overview' ? (
              <>
                <SummaryStrip
                  variant="cashflow"
                  summary={monthRecord.summary}
                  currency={currency}
                  bankBalanceCents={monthRecord.bankBalanceCents}
                />
                <WeeklyRunway
                  year={year}
                  month={month}
                  leftCents={monthRecord.summary.leftCents}
                  items={items}
                  currency={currency}
                />
                <button
                  type="button"
                  onClick={() => setTab('wealth')}
                  className="tile tile-wealth w-full transition hover:brightness-[0.98]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                    Net worth
                  </p>
                  <p className="mt-1 text-lg font-bold text-(--ink)">
                    {formatMoney(netWorthCents, currency)}
                    <span className="ml-2 text-sm font-semibold text-(--accent)">
                      Wealth →
                    </span>
                  </p>
                </button>
              </>
            ) : null}

            {tab === 'plan' ? (
              <>
                {formOpen ? (
                  <ItemForm
                    key={editing?.id ?? 'create'}
                    initial={editing}
                    submitting={creating || updating}
                    onCancel={closeForm}
                    onSubmit={editing ? handleUpdate : handleCreate}
                  />
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={openAdd}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      + Add item
                    </button>
                  </div>
                )}
                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-(--line) bg-white/70 px-4 py-8 text-center text-(--muted)">
                    No items for this month yet.{' '}
                    <button
                      type="button"
                      onClick={openAdd}
                      className="text-(--accent) underline-offset-2 hover:underline"
                    >
                      Add a subscription, rent, or income
                    </button>
                    .
                  </div>
                ) : (
                  <div className="grid gap-8">
                    <ItemList
                      title="Expenses"
                      items={expenses}
                      currency={currency}
                      categoryOrder={EXPENSE_CATEGORIES}
                      onEdit={openEdit}
                      onDelete={(item) => void handleDelete(item)}
                      onToggleActive={(item) => void handleToggleActive(item)}
                    />
                    <ItemList
                      title="Income"
                      items={incomes}
                      currency={currency}
                      categoryOrder={INCOME_CATEGORIES}
                      onEdit={openEdit}
                      onDelete={(item) => void handleDelete(item)}
                      onToggleActive={(item) => void handleToggleActive(item)}
                    />
                  </div>
                )}
              </>
            ) : null}

            {tab === 'bills' ? (
              <BillingCalendar
                year={year}
                month={month}
                items={items}
                currency={currency}
                onTogglePaid={(item) => void handleTogglePaid(item)}
              />
            ) : null}

            {tab === 'wealth' ? (
              <>
                <SummaryStrip
                  variant="wealth"
                  summary={monthRecord.summary}
                  currency={currency}
                  bankBalanceCents={monthRecord.bankBalanceCents}
                  krakenBalance={displayKraken}
                  krakenLoading={useLiveKraken && krakenLoading}
                  krakenLive={useLiveKraken}
                  onRefreshKraken={
                    useLiveKraken
                      ? () => void handleRefreshKraken()
                      : undefined
                  }
                  refreshingKraken={refreshingKraken}
                />
                <GoalsPanel
                  goals={goals}
                  currency={currency}
                  availableCents={netWorthCents}
                  year={year}
                  month={month}
                  manage={false}
                />
              </>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}
