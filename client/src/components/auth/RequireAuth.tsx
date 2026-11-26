import { RedirectToSignIn, Show } from '@clerk/react'
import type { ReactNode } from 'react'

export function RequireAuth({ children }: { children: ReactNode }) {
  return (
    <Show when="signed-in" fallback={<RedirectToSignIn />}>
      {children}
    </Show>
  )
}
