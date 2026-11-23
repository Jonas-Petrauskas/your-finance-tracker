import { useMutation } from '@apollo/client'
import { SET_MONTH_BANK_BALANCE } from '../graphql/operations'
import { monthRefetch } from '../lib/apolloRefetch'

export function useSetBankBalance(year: number, month: number) {
  const [setMonthBankBalance, { loading }] = useMutation(
    SET_MONTH_BANK_BALANCE,
    {
      refetchQueries: [monthRefetch(year, month)],
    },
  )

  async function save(monthId: string, amountCents: number) {
    await setMonthBankBalance({ variables: { monthId, amountCents } })
  }

  return { loading, save }
}
