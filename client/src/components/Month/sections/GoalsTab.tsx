import type { Goal } from '../../../lib/types'
import { GoalsPanel } from '../../Goals/GoalsPanel'

type Props = {
  goals: Goal[]
  currency: string
  availableCents: number
  year: number
  month: number
}

export function GoalsTab({
  goals,
  currency,
  availableCents,
  year,
  month,
}: Props) {
  return (
    <GoalsPanel
      goals={goals}
      currency={currency}
      availableCents={availableCents}
      year={year}
      month={month}
      manage
    />
  )
}
