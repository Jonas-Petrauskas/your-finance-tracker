import { useMutation } from '@apollo/client'
import {
  CREATE_TEMPLATE,
  DELETE_TEMPLATE,
  GET_HOME,
  UPDATE_TEMPLATE,
} from '../graphql/operations'
import type { TemplateInput } from '../lib/types'

export function useTemplatesMutations() {
  const refetch = [{ query: GET_HOME }]

  const [createTemplate, { loading: creating }] = useMutation(CREATE_TEMPLATE, {
    refetchQueries: refetch,
  })
  const [updateTemplate, { loading: updating }] = useMutation(UPDATE_TEMPLATE, {
    refetchQueries: refetch,
  })
  const [deleteTemplate] = useMutation(DELETE_TEMPLATE, {
    refetchQueries: refetch,
  })

  async function create(input: TemplateInput) {
    await createTemplate({ variables: { input } })
  }

  async function update(id: string, input: TemplateInput) {
    await updateTemplate({ variables: { id, input } })
  }

  async function remove(id: string) {
    await deleteTemplate({ variables: { id } })
  }

  return { creating, updating, create, update, remove }
}
