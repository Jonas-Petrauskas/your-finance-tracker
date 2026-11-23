import type { RecurringItem } from '../../../lib/types'
import { BillingCalendar } from '../../ui/BillingCalendar'

type Props = {
  year: number
  month: number
  items: RecurringItem[]
  currency: string
  onTogglePaid: (item: RecurringItem) => void
}

export function BillsTab({
  year,
  month,
  items,
  currency,
  onTogglePaid,
}: Props) {
  return (
    <BillingCalendar
      year={year}
      month={month}
      items={items}
      currency={currency}
      onTogglePaid={onTogglePaid}
    />
  )
}
