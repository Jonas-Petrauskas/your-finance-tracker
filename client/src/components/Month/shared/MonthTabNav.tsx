import { useTranslation } from 'react-i18next'
import type { MonthTab } from '../../../hooks/useItemFormState'

const TAB_IDS: MonthTab[] = ['overview', 'plan', 'bills', 'wealth', 'goals']

type Props = {
  tab: MonthTab
  onChange: (tab: MonthTab) => void
}

export function MonthTabNav({ tab, onChange }: Props) {
  const { t } = useTranslation()

  return (
    <nav
      className="sticky top-2 z-10"
      aria-label={t('month.tabs.ariaLabel')}
    >
      <div
        role="tablist"
        className="month-tablist flex gap-1 overflow-x-auto rounded-2xl border border-(--line) bg-white/80 p-1.5 shadow-[0_8px_24px_rgb(20_60_45_/_0.06)] backdrop-blur-md"
      >
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
                  ? 'tab-active shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-transform duration-150'
                  : 'shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium text-(--muted) transition-colors duration-150 hover:bg-(--accent-soft)/70 hover:text-(--ink)'
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
