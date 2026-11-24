import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { balanceToCents, centsToInput } from '../../lib/format'

type Props = {
  bankBalanceCents: number
  loading?: boolean
  onSave: (amountCents: number) => Promise<unknown>
}

export function BankBalanceSettingView({
  bankBalanceCents,
  loading,
  onSave,
}: Props) {
  const { t } = useTranslation()
  const [value, setValue] = useState(centsToInput(bankBalanceCents))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValue(centsToInput(bankBalanceCents))
  }, [bankBalanceCents])

  return (
    <section className="surface-card p-4 text-left">
      <div className="mb-3">
        <h2 className="display text-lg font-semibold tracking-tight text-(--ink)">
          {t('common.cashSavings')}
        </h2>
        <p className="mt-1 text-sm text-(--muted)">
          {t('month.wealth.savingsHint')}
        </p>
      </div>
      <form
        className="flex flex-col gap-1"
        onSubmit={(event) => {
          event.preventDefault()
          const amountCents = balanceToCents(value)
          if (amountCents === null) {
            setError(t('errors.validation.nonNegativeBalance'))
            return
          }
          setError(null)
          void onSave(amountCents)
        }}
      >
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-sm">
            <span className="text-(--muted)">{t('common.fields.amount')}</span>
            <input
              className="rounded-md border border-(--line) bg-white px-3 py-2"
              inputMode="decimal"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              aria-label={t('month.settings.cashSavingsAria')}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        </div>
        {error ? <p className="text-sm text-(--expense)">{error}</p> : null}
      </form>
    </section>
  )
}
