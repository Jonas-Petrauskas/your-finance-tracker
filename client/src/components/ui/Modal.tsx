import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  labelledBy?: string
  className?: string
}

export function Modal({
  open,
  onClose,
  children,
  labelledBy,
  className = '',
}: Props) {
  const { t } = useTranslation()
  const fallbackTitleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current()
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-(--ink)/40 backdrop-blur-[2px]"
        aria-label={t('common.cancel')}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? fallbackTitleId}
        tabIndex={-1}
        className={`relative z-10 max-h-[min(90svh,44rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-(--line) bg-white shadow-xl outline-none ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
