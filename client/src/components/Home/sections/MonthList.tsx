import type { MonthListItem } from '../../../lib/types'
import { MonthListRow } from '../shared/MonthListRow'

type Props = {
  months: MonthListItem[]
  currency: string
  onDelete: (month: MonthListItem) => void
}

export function MonthList({ months, currency, onDelete }: Props) {
  if (months.length === 0) return null

  return (
    <ul className="grid gap-3.5">
      {months.map((month) => (
        <MonthListRow
          key={month.id}
          month={month}
          currency={currency}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
