import type { ItemInput, RecurringItem } from './types'

export function itemToInput(
  item: RecurringItem,
  patch?: Partial<ItemInput>,
): ItemInput {
  return {
    name: item.name,
    amountCents: item.amountCents,
    direction: item.direction,
    category: item.category,
    billingDay: item.billingDay,
    notes: item.notes,
    active: item.active,
    paid: item.paid,
    oneOff: item.oneOff,
    ...patch,
  }
}
