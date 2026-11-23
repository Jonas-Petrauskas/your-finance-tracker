import type { KrakenBalance, Month } from './types'

export type MonthKrakenFields = Pick<
  Month,
  | 'krakenBalanceCents'
  | 'krakenEarnCents'
  | 'krakenSpotCents'
  | 'krakenSnapshottedAt'
>

export function usesLiveKraken(
  month: Pick<Month, 'krakenSnapshottedAt'> | null | undefined,
): boolean {
  return !month?.krakenSnapshottedAt
}

export function resolveDisplayKraken(
  month: MonthKrakenFields | null | undefined,
  liveBalance: KrakenBalance | null | undefined,
): KrakenBalance | null {
  if (!month) return liveBalance ?? null
  if (month.krakenSnapshottedAt && month.krakenBalanceCents != null) {
    return {
      balanceCents: month.krakenBalanceCents,
      earnCents: month.krakenEarnCents ?? 0,
      spotCents: month.krakenSpotCents ?? 0,
      currency: 'EUR',
      configured: true,
      error: null,
      updatedAt: month.krakenSnapshottedAt,
      cached: false,
    }
  }
  return liveBalance ?? null
}
