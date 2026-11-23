import { useGoalsMutations } from '../../hooks/useGoalsMutations'
import type { Goal } from '../../lib/types'
import { GoalsPanelView } from './GoalsPanelView'

type Props = {
  goals: Goal[]
  currency: string
  availableCents: number
  year?: number
  month?: number
  manage?: boolean
}

/** Thin container: wires goal mutations when manage is enabled. */
export function GoalsPanel({
  goals,
  currency,
  availableCents,
  year,
  month,
  manage = true,
}: Props) {
  const mutations = useGoalsMutations(year, month)

  return (
    <GoalsPanelView
      goals={goals}
      currency={currency}
      availableCents={availableCents}
      manage={manage}
      creating={mutations.creating}
      updating={mutations.updating}
      onCreate={manage ? mutations.create : undefined}
      onUpdate={manage ? mutations.update : undefined}
      onDelete={manage ? mutations.remove : undefined}
    />
  )
}
