import { formatMoney } from '../../lib/format'
import type { KrakenBalance } from '../../lib/types'

type Props = {
  krakenBalance?: KrakenBalance | null
  loading?: boolean
  live?: boolean
  onRefresh?: () => void
  refreshing?: boolean
}

export function KrakenBalanceCard({
  krakenBalance,
  loading = false,
  live = true,
  onRefresh,
  refreshing = false,
}: Props) {
  const currency = krakenBalance?.currency ?? 'EUR'

  return (
    <div className="tile tile-kraken">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-900">
          Kraken total ({currency})
        </p>
        {live && onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || loading}
            className="text-xs font-medium text-sky-800 underline-offset-2 hover:underline disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        ) : null}
      </div>
      {loading && !krakenBalance ? (
        <p className="mt-1 text-sm text-(--muted)">Loading…</p>
      ) : krakenBalance?.error ? (
        <p className="mt-1 text-sm text-(--expense)">{krakenBalance.error}</p>
      ) : (
        <>
          <p className="mt-1 text-2xl font-bold text-sky-950">
            {formatMoney(krakenBalance?.balanceCents ?? 0, currency)}
          </p>
          <p className="mt-1 text-xs text-(--muted)">
            Earn {formatMoney(krakenBalance?.earnCents ?? 0, currency)}
            {' · '}
            Spot {formatMoney(krakenBalance?.spotCents ?? 0, currency)}
          </p>
          <p className="mt-1 text-xs text-(--muted)">
            {live
              ? krakenBalance?.cached
                ? 'Live (cached)'
                : 'Live'
              : 'Snapshot for this month'}
            {krakenBalance?.updatedAt
              ? ` · ${new Date(krakenBalance.updatedAt).toLocaleString()}`
              : ''}
          </p>
        </>
      )}
    </div>
  )
}
