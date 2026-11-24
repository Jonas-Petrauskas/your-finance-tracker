import { useCallback, useState } from 'react'

type PendingConfirm = {
  message: string
  resolve: (confirmed: boolean) => void
}

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const requestConfirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setPending({ message, resolve })
    })
  }, [])

  const close = useCallback((confirmed: boolean) => {
    setPending((current) => {
      current?.resolve(confirmed)
      return null
    })
  }, [])

  return {
    requestConfirm,
    confirmProps: {
      open: pending != null,
      message: pending?.message ?? '',
      onConfirm: () => close(true),
      onCancel: () => close(false),
    },
  }
}
