import { useTranslation } from 'react-i18next'
import type { MonthTab } from '../../../hooks/useItemFormState'

const TAB_IDS: MonthTab[] = ['overview', 'plan', 'bills', 'wealth']

type Props = {
  tab: MonthTab
  onChange: (tab: MonthTab) => void
}

export function MonthTabNav({ tab, onChange }: Props) {
  const { t } = useTranslation()

  return (
    <nav
      className="sticky top-0 z-10 -mx-4 border-b border-(--line) bg-white/75 px-4 backdrop-blur-md sm:-mx-6 sm:px-6"
      aria-label={t('month.tabs.ariaLabel')}
    >
      <div role="tablist" className="flex gap-1 overflow-x-auto py-2">
        {TAB_IDS.map((id) => {
          const selected = tab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`month-tab-${id}`}
              onClick={() => onChange(id)}
              className={
                selected
                  ? 'tab-active shrink-0 rounded-lg px-3 py-2 text-sm font-semibold'
                  : 'shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-(--muted) hover:bg-white/80 hover:text-(--ink)'
              }
            >
              {t(`month.tabs.${id}`)}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
