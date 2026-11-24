import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../lib/format'
import type { KrakenBalance, MonthlySummary } from '../../lib/types'
import {
  computeNetWorthCents,
  computeProjectedCents,
  includeKrakenInWealth,
} from '../../lib/wealth'
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
  const { t } = useTranslation()
  const leftNegative = summary.leftCents < 0
  const includeKraken = includeKrakenInWealth(krakenBalance, currency, {
    loading: krakenLoading,
  })
  const krakenCurrency = krakenBalance?.currency ?? 'EUR'
  const sameCurrency = currency === krakenCurrency

  const netWorthCents = computeNetWorthCents({
    bankBalanceCents,
    kraken: krakenBalance,
    currency,
    krakenLoading,
  })
  const projectedCents = computeProjectedCents({
    bankBalanceCents,
    leftCents: summary.leftCents,
    kraken: krakenBalance,
    currency,
    krakenLoading,
  })

  if (variant === 'cashflow') {
    return (
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="tile tile-income">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--income)">
            {t('common.income')}
          </p>
          <p className="mt-1 text-2xl font-bold text-(--income)">
            {formatMoney(summary.incomeCents, currency)}
          </p>
        </div>
        <div className="tile tile-expense">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--expense)">
            {t('common.expenses')}
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
            {t('month.summary.leftThisMonth')}
          </p>
          <p
            className="mt-1 text-2xl font-bold"
            style={{
              color: leftNegative ? 'var(--left-neg)' : 'var(--left)',
            }}
          >
            {formatMoney(summary.leftCents, currency)}
          </p>
          <p className="mt-1 text-xs text-(--muted)">
            {t('month.summary.cashflowPlan')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="tile tile-bank">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
          {t('common.cashSavings')}
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
          {t('month.wealth.netWorthNow')}
        </p>
        {krakenLoading && !krakenBalance ? (
          <p className="mt-1 text-sm text-(--muted)">{t('common.loading')}</p>
        ) : (
          <>
            <p className="mt-1 text-2xl font-bold text-(--ink)">
              {formatMoney(netWorthCents, currency)}
            </p>
            <p className="mt-1 text-xs text-(--muted)">
              {includeKraken
                ? t('month.wealth.sourceBoth')
                : sameCurrency
                  ? t('month.wealth.sourceBankUnavailable')
                  : t('month.wealth.sourceBankWrongCurrency', {
                      currency: krakenCurrency,
                    })}
            </p>
          </>
        )}
      </div>
      <div className="tile tile-left sm:col-span-2 lg:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--left)">
          {t('month.wealth.projectedAfterMonth')}
        </p>
        {krakenLoading && !krakenBalance ? (
          <p className="mt-1 text-sm text-(--muted)">{t('common.loading')}</p>
        ) : (
          <>
            <p className="mt-1 text-2xl font-bold text-(--left)">
              {formatMoney(projectedCents, currency)}
            </p>
            <p className="mt-1 text-xs text-(--muted)">
              {includeKraken
                ? t('month.wealth.projectedBoth')
                : t('month.wealth.projectedBankOnly')}
            </p>
          </>
        )}
      </div>
    </section>
  )
}
