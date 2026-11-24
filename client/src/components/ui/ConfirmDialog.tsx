import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  message: string
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  message,
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation()
  const titleId = useId()
  const messageId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)
  onCancelRef.current = onCancel

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancelRef.current()
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-(--ink)/40 backdrop-blur-[2px]"
        aria-label={cancelLabel ?? t('common.cancel')}
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-(--line) bg-white p-5 shadow-xl"
      >
        <h2
          id={titleId}
          className="display text-lg font-semibold tracking-tight text-(--ink)"
        >
          {title ?? t('common.confirmTitle')}
        </h2>
        <p id={messageId} className="mt-2 text-sm text-(--muted)">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            className="rounded-md border border-(--line) bg-white px-3 py-2 text-sm font-medium text-(--ink)"
            onClick={onCancel}
          >
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            type="button"
            className="rounded-md border border-(--expense-border) bg-(--expense-soft) px-3 py-2 text-sm font-semibold text-(--expense)"
            onClick={onConfirm}
          >
            {confirmLabel ?? t('common.delete')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
