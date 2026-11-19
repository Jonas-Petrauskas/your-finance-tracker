import { formatMoney } from '../lib/format'
import type { KrakenBalance } from '../lib/types'

type Props = {
  krakenBalance?: KrakenBalance | null
  loading?: boolean
  align?: 'left' | 'right'
}

export function KrakenBalanceCard({
  krakenBalance,
  loading = false,
  align = 'left',
}: Props) {
  const textAlign = align === 'right' ? 'sm:text-right' : 'text-left'

  return (
    <div
      className={`rounded-xl border border-(--line) bg-(--panel) px-4 py-3 text-left ${textAlign}`}
    >
      <p className="text-xs uppercase tracking-wide text-(--muted)">
        Kraken total
      </p>
      {loading && !krakenBalance ? (
        <p className="mt-1 text-sm text-(--muted)">Loading…</p>
      ) : krakenBalance?.error ? (
        <p className="mt-1 text-sm text-(--expense)">{krakenBalance.error}</p>
      ) : (
        <>
          <p className="mt-1 text-2xl font-semibold text-(--ink)">
            {formatMoney(
              krakenBalance?.balanceCents ?? 0,
              krakenBalance?.currency ?? 'EUR',
            )}
          </p>
          <p className="mt-1 text-xs text-(--muted)">
            Earn{' '}
            {formatMoney(
              krakenBalance?.earnCents ?? 0,
              krakenBalance?.currency ?? 'EUR',
            )}
            {' · '}
            Spot{' '}
            {formatMoney(
              krakenBalance?.spotCents ?? 0,
              krakenBalance?.currency ?? 'EUR',
            )}
          </p>
        </>
      )}
    </div>
  )
}
