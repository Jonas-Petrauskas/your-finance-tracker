import { useTranslation } from 'react-i18next'
import {
  isSupportedCurrency,
  SUPPORTED_CURRENCIES,
} from '../../lib/currencies'
import { SelectMenu } from '../ui/SelectMenu'

type Props = {
  currency: string
  loading?: boolean
  onSave: (currency: string) => Promise<unknown>
}

export function CurrencySettingView({ currency, loading, onSave }: Props) {
  const { t } = useTranslation()
  const value = isSupportedCurrency(currency) ? currency : 'EUR'

  return (
    <div className="w-fit text-left">
      <SelectMenu
        label={t('common.fields.currency')}
        value={value}
        options={[...SUPPORTED_CURRENCIES]}
        disabled={loading}
        showCheck={false}
        compact
        onChange={(next) => {
          if (next !== currency) void onSave(next)
        }}
      />
    </div>
  )
}
