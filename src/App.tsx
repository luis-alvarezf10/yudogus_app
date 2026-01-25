import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/hooks/useAuthContext'
import { LoginPage } from './features/auth'
import { DashboardPage, ManagerDashboardPage } from './features/dashboard'
import { ScheduleReviewPage } from './features/reviews'

function App() {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : user?.is_manager ? (
          <>
            <Route path="/dashboard" element={<ManagerDashboardPage />} />
            <Route path="/reviews/schedule" element={<ScheduleReviewPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
