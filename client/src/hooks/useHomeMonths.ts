import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  CREATE_NEXT_MONTH,
  DELETE_MONTH,
  GET_HOME,
} from '../graphql/operations'
import { graphqlErrorMessage } from '../lib/format'
import type { MonthListItem } from '../lib/types'

type HomeData = {
  months: MonthListItem[]
  settings: { currency: string }
}

export function useHomeMonths() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, loading, error } = useQuery<HomeData>(GET_HOME)
  const [actionError, setActionError] = useState<string | null>(null)
  const [createNextMonth, { loading: creating }] = useMutation(
    CREATE_NEXT_MONTH,
    { refetchQueries: [{ query: GET_HOME }] },
  )
  const [deleteMonth] = useMutation(DELETE_MONTH, {
    refetchQueries: [{ query: GET_HOME }],
  })

  const currency = data?.settings.currency ?? 'EUR'
  const months = data?.months ?? []

  async function addNextMonth() {
    try {
      setActionError(null)
      const result = await createNextMonth()
      const created = result.data?.createNextMonth as MonthListItem | undefined
      if (created) navigate(`/months/${created.year}/${created.month}`)
    } catch (err) {
      setActionError(
        graphqlErrorMessage(err, t('errors.createNextMonth')),
      )
    }
  }

  async function removeMonth(month: MonthListItem) {
    if (
      !window.confirm(
        t('home.confirmDeleteMonth', { label: month.label }),
      )
    ) {
      return
    }
    try {
      setActionError(null)
      await deleteMonth({ variables: { id: month.id } })
    } catch (err) {
      setActionError(graphqlErrorMessage(err, t('errors.deleteMonth')))
    }
  }

  return {
    months,
    currency,
    loading,
    error: Boolean(error),
    hasData: Boolean(data),
    actionError,
    creating,
    addNextMonth,
    removeMonth,
  }
}
