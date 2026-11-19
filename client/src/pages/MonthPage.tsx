import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BankBalanceSetting } from '../components/BankBalanceSetting'
import { CurrencySetting } from '../components/CurrencySetting'
import { ItemForm } from '../components/ItemForm'
import { ItemList } from '../components/ItemList'
import { SummaryStrip } from '../components/SummaryStrip'
import {
  CREATE_ITEM,
  DELETE_ITEM,
  GET_KRAKEN_BALANCE,
  GET_MONTH,
  UPDATE_ITEM,
} from '../graphql/operations'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type ItemInput,
  type KrakenBalance,
  type Month,
  type RecurringItem,
} from '../lib/types'

type MonthData = {
  monthByDate: Month | null
  settings: { currency: string }
}

type KrakenData = {
  krakenBalance: KrakenBalance
}

export function MonthPage() {
  const params = useParams()
  const year = Number(params.year)
  const month = Number(params.month)
  const valid = Number.isInteger(year) && Number.isInteger(month)

  const { data, loading, error } = useQuery<MonthData>(GET_MONTH, {
    variables: { year, month },
    skip: !valid,
  })
  const {
    data: krakenData,
    loading: krakenLoading,
  } = useQuery<KrakenData>(GET_KRAKEN_BALANCE, {
    fetchPolicy: 'network-only',
    skip: !valid,
  })
  const [editing, setEditing] = useState<RecurringItem | null>(null)

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

  const currency = data?.settings.currency ?? 'EUR'
  const items = monthRecord?.items ?? []
  const expenses = items.filter((item) => item.direction === 'EXPENSE')
  const incomes = items.filter((item) => item.direction === 'INCOME')

  async function handleCreate(input: ItemInput) {
    if (!monthRecord) return
    await createItem({ variables: { monthId: monthRecord.id, input } })
  }

  async function handleUpdate(input: ItemInput) {
    if (!editing) return
    await updateItem({ variables: { id: editing.id, input } })
    setEditing(null)
  }

  async function handleToggleActive(item: RecurringItem) {
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
        },
      },
    })
  }

  async function handleDelete(item: RecurringItem) {
    if (!window.confirm(`Delete “${item.name}”?`)) return
    await deleteItem({ variables: { id: item.id } })
    if (editing?.id === item.id) setEditing(null)
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
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
          <p className="mt-2 max-w-xl text-(--muted)">
            Disable items that do not apply this month — they stay out of the
            totals without deleting them.
          </p>
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

      {loading && !data ? (
        <p className="text-(--muted)">Loading…</p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-(--expense) bg-white px-3 py-2 text-(--expense)">
          Could not reach GraphQL. Is the server running on port 4000?
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
          <SummaryStrip
            summary={monthRecord.summary}
            currency={currency}
            bankBalanceCents={monthRecord.bankBalanceCents}
            krakenBalance={krakenData?.krakenBalance}
            krakenLoading={krakenLoading}
          />

          <ItemForm
            key={editing?.id ?? 'create'}
            initial={editing}
            submitting={creating || updating}
            onCancel={editing ? () => setEditing(null) : undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
          />

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-(--line) bg-white/70 px-4 py-8 text-center text-(--muted)">
              No items for this month yet. Add a subscription, rent payment, or
              income above.
            </div>
          ) : (
            <div className="grid gap-8">
              <ItemList
                title="Expenses"
                items={expenses}
                currency={currency}
                categoryOrder={EXPENSE_CATEGORIES}
                onEdit={setEditing}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
              <ItemList
                title="Income"
                items={incomes}
                currency={currency}
                categoryOrder={INCOME_CATEGORIES}
                onEdit={setEditing}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
