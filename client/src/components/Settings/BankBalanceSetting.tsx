import { useSetBankBalance } from '../../hooks/useSetBankBalance'
import { BankBalanceSettingView } from './BankBalanceSettingView'

type Props = {
  monthId: string
  bankBalanceCents: number
  year: number
  month: number
}

export function BankBalanceSetting({
  monthId,
  bankBalanceCents,
  year,
  month,
}: Props) {
  const { loading, save } = useSetBankBalance(year, month)

  return (
    <BankBalanceSettingView
      bankBalanceCents={bankBalanceCents}
      loading={loading}
      onSave={(amountCents) => save(monthId, amountCents)}
    />
  )
}
