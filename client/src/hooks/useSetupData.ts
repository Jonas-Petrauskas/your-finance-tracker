import { useQuery } from '@apollo/client'
import { GET_HOME } from '../graphql/operations'
import { computeNetWorthCents } from '../lib/wealth'
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

export function useSetupData() {
  const { data, loading, error } = useQuery<SetupData>(GET_HOME)

  const currency = data?.settings.currency ?? 'EUR'
  const goals = data?.goals ?? []
  const templates = data?.templates ?? []
  const months = data?.months ?? []
  const latestBank = months[0]?.bankBalanceCents ?? 0
  const netWorthCents = computeNetWorthCents({
    bankBalanceCents: latestBank,
    kraken: data?.krakenBalance,
    currency,
  })

  return {
    currency,
    goals,
    templates,
    netWorthCents,
    loading,
    error: Boolean(error),
    hasData: Boolean(data),
  }
}
