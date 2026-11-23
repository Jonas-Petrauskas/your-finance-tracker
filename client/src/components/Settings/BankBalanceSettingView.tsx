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
    <form
      className="flex flex-col gap-1 text-left"
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
      <div className="flex items-end gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-(--muted)">{t('common.bankSavings')}</span>
          <input
            className="w-36 rounded-md border border-(--line) bg-white px-2 py-1.5"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label={t('month.settings.bankSavingsAria')}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {t('common.save')}
        </button>
      </div>
      {error ? <p className="text-sm text-(--expense)">{error}</p> : null}
    </form>
  )
}
