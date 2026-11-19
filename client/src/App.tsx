import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { MonthPage } from './pages/MonthPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/months/:year/:month" element={<MonthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
