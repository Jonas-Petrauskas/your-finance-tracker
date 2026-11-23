import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { GET_MONTH } from '../graphql/operations'
import type { Goal, ItemInput, Month } from '../lib/types'
import { computeNetWorthCents } from '../lib/wealth'
import { useItemFormState, type MonthTab } from './useItemFormState'
import { useKrakenBalance } from './useKrakenBalance'
import { useMonthItemActions } from './useMonthItemActions'

type MonthData = {
  monthByDate: Month | null
  settings: { currency: string }
  goals: Goal[]
}

export function useMonthWorkspace() {
  const params = useParams()
  const year = Number(params.year)
  const month = Number(params.month)
  const valid = Number.isInteger(year) && Number.isInteger(month)

  const { data, loading, error } = useQuery<MonthData>(GET_MONTH, {
    variables: { year, month },
    skip: !valid,
  })

  const [tab, setTab] = useState<MonthTab>('overview')
  const form = useItemFormState(setTab)

  const monthRecord = data?.monthByDate ?? null
  const currency = data?.settings.currency ?? 'EUR'
  const items = monthRecord?.items ?? []
  const expenses = items.filter((item) => item.direction === 'EXPENSE')
  const incomes = items.filter((item) => item.direction === 'INCOME')
  const goals = data?.goals ?? []

  const kraken = useKrakenBalance(monthRecord, { skip: !valid })
  const actions = useMonthItemActions({
    monthId: monthRecord?.id,
    year,
    month,
    editing: form.editing,
    onCreated: () => form.setShowForm(false),
    onUpdated: form.closeForm,
    onDeletedEditing: form.closeForm,
  })

  const netWorthCents = computeNetWorthCents({
    bankBalanceCents: monthRecord?.bankBalanceCents ?? 0,
    kraken: kraken.displayKraken,
    currency,
    krakenLoading: kraken.krakenLoading,
  })

  async function submitItem(input: ItemInput) {
    if (form.editing) await actions.update(input)
    else await actions.create(input)
  }

  return {
    year,
    month,
    valid,
    loading,
    error: Boolean(error),
    hasData: Boolean(data),
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
  }
}
