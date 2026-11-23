import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CREATE_ITEM,
  DELETE_ITEM,
  SET_ITEM_PAID,
  UPDATE_ITEM,
} from '../graphql/operations'
import { monthRefetch } from '../lib/apolloRefetch'
import { graphqlErrorMessage } from '../lib/format'
import { itemToInput } from '../lib/items'
import type { ItemInput, RecurringItem } from '../lib/types'

type Options = {
  monthId: string | undefined
  year: number
  month: number
  editing: RecurringItem | null
  onCreated?: () => void
  onUpdated?: () => void
  onDeletedEditing?: () => void
}

export function useMonthItemActions({
  monthId,
  year,
  month,
  editing,
  onCreated,
  onUpdated,
  onDeletedEditing,
}: Options) {
  const { t } = useTranslation()
  const [formError, setFormError] = useState<string | null>(null)
  const refetch = [monthRefetch(year, month)]

  const [createItem, { loading: creating }] = useMutation(CREATE_ITEM, {
    refetchQueries: refetch,
  })
  const [updateItem, { loading: updating }] = useMutation(UPDATE_ITEM, {
    refetchQueries: refetch,
  })
  const [deleteItem] = useMutation(DELETE_ITEM, {
    refetchQueries: refetch,
  })
  const [setItemPaid] = useMutation(SET_ITEM_PAID, {
    refetchQueries: refetch,
  })

  async function create(input: ItemInput) {
    if (!monthId) return
    try {
      setFormError(null)
      await createItem({ variables: { monthId, input } })
      onCreated?.()
    } catch (err) {
      setFormError(graphqlErrorMessage(err, t('errors.createItem')))
    }
  }

  async function update(input: ItemInput) {
    if (!editing) return
    try {
      setFormError(null)
      await updateItem({ variables: { id: editing.id, input } })
      onUpdated?.()
    } catch (err) {
      setFormError(graphqlErrorMessage(err, t('errors.updateItem')))
    }
  }

  async function toggleActive(item: RecurringItem) {
    try {
      setFormError(null)
      await updateItem({
        variables: {
          id: item.id,
          input: itemToInput(item, { active: !item.active }),
        },
      })
    } catch (err) {
      setFormError(graphqlErrorMessage(err, t('errors.updateItem')))
    }
  }

  async function togglePaid(item: RecurringItem) {
    try {
      setFormError(null)
      await setItemPaid({ variables: { id: item.id, paid: !item.paid } })
    } catch (err) {
      setFormError(graphqlErrorMessage(err, t('errors.updatePaidStatus')))
    }
  }

  async function remove(item: RecurringItem) {
    if (!window.confirm(t('month.confirmDeleteItem', { name: item.name }))) {
      return
    }
    try {
      setFormError(null)
      await deleteItem({ variables: { id: item.id } })
      if (editing?.id === item.id) onDeletedEditing?.()
    } catch (err) {
      setFormError(graphqlErrorMessage(err, t('errors.deleteItem')))
    }
  }

  return {
    formError,
    creating,
    updating,
    create,
    update,
    toggleActive,
    togglePaid,
    remove,
  }
}
