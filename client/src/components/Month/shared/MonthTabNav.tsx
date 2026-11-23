import type { MonthTab } from '../../../hooks/useItemFormState'

const TABS: { id: MonthTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'plan', label: 'Plan' },
  { id: 'bills', label: 'Bills' },
  { id: 'wealth', label: 'Wealth' },
]

type Props = {
  tab: MonthTab
  onChange: (tab: MonthTab) => void
}

export function MonthTabNav({ tab, onChange }: Props) {
  return (
    <nav
      className="sticky top-0 z-10 -mx-4 border-b border-(--line) bg-white/75 px-4 backdrop-blur-md sm:-mx-6 sm:px-6"
      aria-label="Month sections"
    >
      <div role="tablist" className="flex gap-1 overflow-x-auto py-2">
        {TABS.map((item) => {
          const selected = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`month-tab-${item.id}`}
              onClick={() => onChange(item.id)}
              className={
                selected
                  ? 'tab-active shrink-0 rounded-lg px-3 py-2 text-sm font-semibold'
                  : 'shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-(--muted) hover:bg-white/80 hover:text-(--ink)'
              }
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
