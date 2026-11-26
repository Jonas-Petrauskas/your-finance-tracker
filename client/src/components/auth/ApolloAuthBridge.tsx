import { useAuth } from '@clerk/react'
import { useEffect, type ReactNode } from 'react'
import { setApolloAuthTokenGetter } from '../../lib/apollo'

export function ApolloAuthBridge({ children }: { children: ReactNode }) {
  const { getToken, isLoaded } = useAuth()

  useEffect(() => {
    setApolloAuthTokenGetter(async () => {
      if (!isLoaded) return null
      return getToken()
    })
  }, [getToken, isLoaded])

  return children
}
