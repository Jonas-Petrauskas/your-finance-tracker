import { formatMoney } from '../lib/format'
import type { KrakenBalance, MonthlySummary } from '../lib/types'
import { KrakenBalanceCard } from './KrakenBalanceCard'

export type SummaryVariant = 'cashflow' | 'wealth'

type Props = {
  summary: MonthlySummary
  currency: string
  bankBalanceCents: number
  variant?: SummaryVariant
  krakenBalance?: KrakenBalance | null
  krakenLoading?: boolean
  krakenLive?: boolean
  onRefreshKraken?: () => void
  refreshingKraken?: boolean
}

export function SummaryStrip({
  summary,
  currency,
  bankBalanceCents,
  variant = 'cashflow',
  krakenBalance,
  krakenLoading = false,
  krakenLive = true,
  onRefreshKraken,
  refreshingKraken = false,
}: Props) {
  const leftNegative = summary.leftCents < 0
  const krakenOk =
    Boolean(krakenBalance) && !krakenBalance?.error && !krakenLoading
  const krakenCents = krakenOk ? (krakenBalance?.balanceCents ?? 0) : 0
  const krakenCurrency = krakenBalance?.currency ?? 'EUR'
  const sameCurrency = currency === krakenCurrency
  const includeKraken = sameCurrency && krakenOk

  const netWorthCents = bankBalanceCents + (includeKraken ? krakenCents : 0)
  const projectedCents = netWorthCents + summary.leftCents

  if (variant === 'cashflow') {
    return (
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="tile tile-income">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--income)">
            Income
          </p>
          <p className="mt-1 text-2xl font-bold text-(--income)">
            {formatMoney(summary.incomeCents, currency)}
          </p>
        </div>
        <div className="tile tile-expense">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--expense)">
            Expenses
          </p>
          <p className="mt-1 text-2xl font-bold text-(--expense)">
            {formatMoney(summary.expenseCents, currency)}
          </p>
        </div>
        <div
          className={`tile ${leftNegative ? 'tile-left-neg' : 'tile-left'}`}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{
              color: leftNegative ? 'var(--left-neg)' : 'var(--left)',
            }}
          >
            Left this month
          </p>
          <p
            className="mt-1 text-2xl font-bold"
            style={{
              color: leftNegative ? 'var(--left-neg)' : 'var(--left)',
            }}
          >
            {formatMoney(summary.leftCents, currency)}
          </p>
          <p className="mt-1 text-xs text-(--muted)">Cashflow plan</p>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="tile tile-bank">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
          Bank savings
        </p>
        <p className="mt-1 text-2xl font-bold text-(--ink)">
          {formatMoney(bankBalanceCents, currency)}
        </p>
      </div>
      <KrakenBalanceCard
        krakenBalance={krakenBalance}
        loading={krakenLoading}
        live={krakenLive}
        onRefresh={onRefreshKraken}
        refreshing={refreshingKraken}
      />
      <div className="tile tile-wealth">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
          Net worth now
        </p>
        {krakenLoading && !krakenBalance ? (
          <p className="mt-1 text-sm text-(--muted)">Loading…</p>
        ) : (
          <>
            <p className="mt-1 text-2xl font-bold text-(--ink)">
              {formatMoney(netWorthCents, currency)}
            </p>
            <p className="mt-1 text-xs text-(--muted)">
              {includeKraken
                ? 'Bank + Kraken'
                : sameCurrency
                  ? 'Bank only (Kraken unavailable)'
                  : `Bank only — Kraken is ${krakenCurrency}`}
            </p>
          </>
        )}
      </div>
      <div className="tile tile-left sm:col-span-2 lg:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--left)">
          Projected after month
        </p>
        {krakenLoading && !krakenBalance ? (
          <p className="mt-1 text-sm text-(--muted)">Loading…</p>
        ) : (
          <>
            <p className="mt-1 text-2xl font-bold text-(--left)">
              {formatMoney(projectedCents, currency)}
            </p>
            <p className="mt-1 text-xs text-(--muted)">
              {includeKraken
                ? 'Bank + Kraken + left'
                : 'Bank + left (Kraken excluded)'}
            </p>
          </>
        )}
      </div>
    </section>
  )
}
