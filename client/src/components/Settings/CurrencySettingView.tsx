import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  currency: string
  loading?: boolean
  onSave: (currency: string) => Promise<unknown>
}

export function CurrencySettingView({ currency, loading, onSave }: Props) {
  const { t } = useTranslation()
  const [value, setValue] = useState(currency)

  useEffect(() => {
    setValue(currency)
  }, [currency])

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        void onSave(value)
      }}
    >
      <label className="flex flex-col gap-1 text-left text-sm">
        <span className="text-(--muted)">{t('common.fields.currency')}</span>
        <input
          className="w-20 rounded-md border border-(--line) bg-white px-2 py-1.5 uppercase"
          value={value}
          maxLength={3}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          aria-label={t('month.settings.currencyAria')}
        />
      </label>
      <button
        type="submit"
        disabled={loading || value === currency}
        className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {t('common.save')}
      </button>
    </form>
  )
}
