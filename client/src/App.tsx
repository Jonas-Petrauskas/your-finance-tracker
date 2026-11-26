import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { HomePage } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import { PrivacyPage, TermsPage } from './pages/LegalPage'
import { MonthPage } from './pages/MonthPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route
        path="/months"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route path="/setup" element={<Navigate to="/months" replace />} />
      <Route
        path="/months/:year/:month"
        element={
          <RequireAuth>
            <MonthPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
