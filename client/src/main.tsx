import './i18n'
import { ClerkProvider } from '@clerk/react'
import { ApolloProvider } from '@apollo/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ApolloAuthBridge } from './components/auth/ApolloAuthBridge.tsx'
import './index.css'
import { apolloClient } from './lib/apollo.ts'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <ApolloAuthBridge>
            <App />
          </ApolloAuthBridge>
        </BrowserRouter>
      </ApolloProvider>
    </ClerkProvider>
  </StrictMode>,
)
