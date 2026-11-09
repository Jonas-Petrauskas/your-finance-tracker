import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { BankBalanceSetting } from './components/BankBalanceSetting'
import { CurrencySetting } from './components/CurrencySetting'
import { ItemForm } from './components/ItemForm'
import { ItemList } from './components/ItemList'
import { SummaryStrip } from './components/SummaryStrip'
import {
  CREATE_ITEM,
  DELETE_ITEM,
  GET_DASHBOARD,
  UPDATE_ITEM,
} from './graphql/operations'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type ItemInput,
  type RecurringItem,
} from './lib/types'

type DashboardData = {
  items: RecurringItem[]
  monthlySummary: {
    incomeCents: number
    expenseCents: number
    leftCents: number
  }
  settings: { currency: string; bankBalanceCents: number }
}

export default function App() {
  const { data, loading, error } = useQuery<DashboardData>(GET_DASHBOARD)
  const [editing, setEditing] = useState<RecurringItem | null>(null)

  const [createItem, { loading: creating }] = useMutation(CREATE_ITEM, {
    refetchQueries: [{ query: GET_DASHBOARD }],
  })
  const [updateItem, { loading: updating }] = useMutation(UPDATE_ITEM, {
    refetchQueries: [{ query: GET_DASHBOARD }],
  })
  const [deleteItem] = useMutation(DELETE_ITEM, {
    refetchQueries: [{ query: GET_DASHBOARD }],
  })

  const currency = data?.settings.currency ?? 'EUR'
  const bankBalanceCents = data?.settings.bankBalanceCents ?? 0
  const items = data?.items ?? []
  const expenses = items.filter((item) => item.direction === 'EXPENSE')
  const incomes = items.filter((item) => item.direction === 'INCOME')

  async function handleCreate(input: ItemInput) {
    await createItem({ variables: { input } })
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
          <p className="text-sm uppercase tracking-[0.18em] text-(--muted)">
            Personal money
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">
            Monthly spending
          </h1>
          <p className="mt-2 max-w-xl text-(--muted)">
            Track subscriptions, rent, bills, bank payments, and government
            income. See what is left each month.
          </p>
        </div>
        {data ? (
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <CurrencySetting currency={currency} />
            <BankBalanceSetting bankBalanceCents={bankBalanceCents} />
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

      {data ? (
        <>
          <SummaryStrip
            summary={data.monthlySummary}
            currency={currency}
            bankBalanceCents={bankBalanceCents}
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
              No monthly items yet. Add your first subscription, rent payment, or
              government income above.
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
