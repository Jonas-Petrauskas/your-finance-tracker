import { useMutation } from '@apollo/client'
import {
  CREATE_GOAL,
  DELETE_GOAL,
  UPDATE_GOAL,
} from '../graphql/operations'
import { homeAndMonthRefetch } from '../lib/apolloRefetch'
import type { GoalInput } from '../lib/types'

export function useGoalsMutations(year?: number, month?: number) {
  const refetch = homeAndMonthRefetch(year, month)

  const [createGoal, { loading: creating }] = useMutation(CREATE_GOAL, {
    refetchQueries: refetch,
  })
  const [updateGoal, { loading: updating }] = useMutation(UPDATE_GOAL, {
    refetchQueries: refetch,
  })
  const [deleteGoal] = useMutation(DELETE_GOAL, { refetchQueries: refetch })

  async function create(input: GoalInput) {
    await createGoal({ variables: { input } })
  }

  async function update(id: string, input: GoalInput) {
    await updateGoal({ variables: { id, input } })
  }

  async function remove(id: string) {
    await deleteGoal({ variables: { id } })
  }

  return { creating, updating, create, update, remove }
}
