import { useState } from 'react'
import type { RecurringItem } from '../lib/types'

export type MonthTab = 'overview' | 'plan' | 'bills' | 'wealth'

export function useItemFormState(setTab?: (tab: MonthTab) => void) {
  const [editing, setEditing] = useState<RecurringItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  const formOpen = showForm || editing != null

  function openAdd() {
    setEditing(null)
    setShowForm(true)
    setTab?.('plan')
  }

  function openEdit(item: RecurringItem) {
    setEditing(item)
    setShowForm(true)
    setTab?.('plan')
  }

  function closeForm() {
    setEditing(null)
    setShowForm(false)
  }

  return {
    editing,
    formOpen,
    openAdd,
    openEdit,
    closeForm,
    setShowForm,
  }
}
