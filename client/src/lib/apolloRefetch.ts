import type { InternalRefetchQueriesInclude } from '@apollo/client'
import { GET_HOME, GET_MONTH } from '../graphql/operations'

export function homeAndMonthRefetch(
  year?: number,
  month?: number,
): InternalRefetchQueriesInclude {
  if (year != null && month != null) {
    return [
      { query: GET_HOME },
      { query: GET_MONTH, variables: { year, month } },
    ]
  }
  return [{ query: GET_HOME }]
}

export function monthRefetch(year: number, month: number) {
  return { query: GET_MONTH, variables: { year, month } }
}
