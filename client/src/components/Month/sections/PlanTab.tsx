import { useTranslation } from 'react-i18next'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type ItemInput,
  type RecurringItem,
} from '../../../lib/types'
import { ItemForm } from '../../ui/ItemForm'
import { ItemList } from '../../ui/ItemList'

type Props = {
  currency: string
  items: RecurringItem[]
  expenses: RecurringItem[]
  incomes: RecurringItem[]
  formOpen: boolean
  editing: RecurringItem | null
  submitting: boolean
  onOpenAdd: () => void
  onCloseForm: () => void
  onSubmit: (input: ItemInput) => Promise<void>
  onEdit: (item: RecurringItem) => void
  onDelete: (item: RecurringItem) => void
  onToggleActive: (item: RecurringItem) => void
}

export function PlanTab({
  currency,
  items,
  expenses,
  incomes,
  formOpen,
  editing,
  submitting,
  onOpenAdd,
  onCloseForm,
  onSubmit,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const { t } = useTranslation()

  return (
    <>
      {formOpen ? (
        <ItemForm
          key={editing?.id ?? 'create'}
          initial={editing}
          submitting={submitting}
          onCancel={onCloseForm}
          onSubmit={onSubmit}
        />
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenAdd}
            className="btn-primary px-4 py-2 text-sm"
          >
            {t('month.plan.addItem')}
          </button>
        </div>
      )}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--line) bg-white/70 px-4 py-8 text-center text-(--muted)">
          {t('month.plan.empty')}{' '}
          <button
            type="button"
            onClick={onOpenAdd}
            className="text-(--accent) underline-offset-2 hover:underline"
          >
            {t('month.plan.emptyCta')}
          </button>
          .
        </div>
      ) : (
        <div className="grid gap-8">
          <ItemList
            title={t('common.expenses')}
            items={expenses}
            currency={currency}
            categoryOrder={EXPENSE_CATEGORIES}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
          <ItemList
            title={t('common.income')}
            items={incomes}
            currency={currency}
            categoryOrder={INCOME_CATEGORIES}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        </div>
      )}
    </>
  )
}
