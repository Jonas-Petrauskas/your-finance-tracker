import { useMutation } from '@apollo/client'
import { SET_CURRENCY } from '../graphql/operations'
import { homeAndMonthRefetch } from '../lib/apolloRefetch'

export function useSetCurrency(year?: number, month?: number) {
  const [setCurrency, { loading }] = useMutation(SET_CURRENCY, {
    refetchQueries: homeAndMonthRefetch(year, month),
  })

  async function save(currency: string) {
    await setCurrency({ variables: { currency } })
  }

  return { loading, save }
}
