import type { KrakenBalance } from './types'

export function includeKrakenInWealth(
  kraken: KrakenBalance | null | undefined,
  currency: string,
  options?: { loading?: boolean },
): boolean {
  if (!kraken || kraken.error || options?.loading) return false
  const krakenCurrency = kraken.currency ?? 'EUR'
  return currency === krakenCurrency
}

export function computeNetWorthCents(params: {
  bankBalanceCents: number
  kraken?: KrakenBalance | null
  currency: string
  krakenLoading?: boolean
}): number {
  const { bankBalanceCents, kraken, currency, krakenLoading } = params
  if (!includeKrakenInWealth(kraken, currency, { loading: krakenLoading })) {
    return bankBalanceCents
  }
  return bankBalanceCents + (kraken?.balanceCents ?? 0)
}

export function computeProjectedCents(params: {
  bankBalanceCents: number
  leftCents: number
  kraken?: KrakenBalance | null
  currency: string
  krakenLoading?: boolean
}): number {
  return computeNetWorthCents(params) + params.leftCents
}
