import { useSetCurrency } from '../../hooks/useSetCurrency'
import { CurrencySettingView } from './CurrencySettingView'

type Props = {
  currency: string
  year?: number
  month?: number
}

export function CurrencySetting({ currency, year, month }: Props) {
  const { loading, save } = useSetCurrency(year, month)
  return (
    <CurrencySettingView currency={currency} loading={loading} onSave={save} />
  )
}
