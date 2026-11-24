import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'

export type SelectOption<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  label?: string
  id?: string
  disabled?: boolean
}

type MenuPosition = {
  top: number
  left: number
  width: number
}

export function SelectMenu<T extends string>({
  value,
  options,
  onChange,
  label,
  id,
  disabled = false,
}: Props<T>) {
  const generatedId = useId()
  const listboxId = `${id ?? generatedId}-listbox`
  const buttonId = id ?? generatedId
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  )

  const selected = options.find((option) => option.value === value) ?? options[0]

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setPosition(null)
      return
    }

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      const menuHeight = menuRef.current?.offsetHeight ?? 220
      const spaceBelow = window.innerHeight - rect.bottom
      const gap = 10
      const openUpward = spaceBelow < menuHeight + gap + 8 && rect.top > spaceBelow
      setPosition({
        top: openUpward ? rect.top - menuHeight - gap : rect.bottom + gap,
        left: rect.left,
        width: rect.width,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, options.length])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const index = options.findIndex((option) => option.value === value)
    setActiveIndex(index >= 0 ? index : 0)
    menuRef.current?.focus()
  }, [open, options, value])

  function selectValue(next: T) {
    onChange(next)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
      return
    }

    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % options.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + options.length) % options.length)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const option = options[activeIndex]
      if (option) selectValue(option.value)
    }
  }

  return (
    <div ref={rootRef} className="relative grid gap-1 text-sm">
      {label ? (
        <span id={`${buttonId}-label`} className="text-(--muted)">
          {label}
        </span>
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        id={buttonId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={label ? `${buttonId}-label` : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
        className={`flex w-full items-center justify-between gap-3 rounded-md border bg-white px-3 py-2 text-left text-(--ink) transition duration-150 focus:border-[#1a6fd4] focus:outline-none focus:ring-2 focus:ring-[#1a6fd4]/25 ${
          open
            ? 'border-[#1a6fd4] ring-2 ring-[#1a6fd4]/25'
            : 'border-(--line)'
        } disabled:opacity-50`}
      >
        <span className="min-w-0 truncate">{selected?.label}</span>
        <span
          className={`ml-auto shrink-0 text-(--muted) transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          <ChevronIcon />
        </span>
      </button>

      {open && position && typeof document !== 'undefined'
        ? createPortal(
            <ul
              ref={menuRef}
              id={listboxId}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={label ? `${buttonId}-label` : buttonId}
              onKeyDown={onListKeyDown}
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
              }}
              className="fixed z-[60] flex max-h-64 flex-col gap-1 overflow-auto rounded-2xl border border-(--line) bg-gradient-to-b from-white to-[#f7fcf9] p-2 shadow-[0_18px_44px_rgb(20_60_45_/_0.16)] outline-none"
            >
              {options.map((option, index) => {
                const isSelected = option.value === value
                const isActive = index === activeIndex
                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectValue(option.value)}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm transition duration-150 ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#14916e] to-(--accent) font-semibold text-white shadow-[0_6px_14px_rgb(15_122_92_/_0.28)]'
                          : isActive
                            ? 'bg-(--accent-soft) text-(--ink)'
                            : 'text-(--ink) hover:bg-(--accent-soft)/80'
                      }`}
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                      {isSelected ? <CheckIcon /> : null}
                    </button>
                  </li>
                )
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
