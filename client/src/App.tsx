import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import { MonthPage } from './pages/MonthPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/months" element={<HomePage />} />
      <Route path="/setup" element={<Navigate to="/months" replace />} />
      <Route path="/months/:year/:month" element={<MonthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
