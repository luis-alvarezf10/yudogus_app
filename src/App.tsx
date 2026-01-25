import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/hooks/useAuthContext'
import { LoginPage } from './features/auth'
import { DashboardPage, ManagerDashboardPage, DashboardLayout } from './features/dashboard'
import { ScheduleReviewPage, ReviewsPage, ReviewDetailPage } from './features/reviews'
import { ProjectsPage, CreateProjectPage } from './features/projects'
import { ClientsPage } from './features/clients'
import { EmployeesPage } from './features/employees'

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
            <Route path="/dashboard" element={<DashboardLayout><ManagerDashboardPage /></DashboardLayout>} />
            <Route path="/projects" element={<DashboardLayout><ProjectsPage /></DashboardLayout>} />
            <Route path="/projects/create" element={<CreateProjectPage />} />
            <Route path="/clients" element={<DashboardLayout><ClientsPage /></DashboardLayout>} />
            <Route path="/employees" element={<DashboardLayout><EmployeesPage /></DashboardLayout>} />
            <Route path="/reviews" element={<DashboardLayout><ReviewsPage /></DashboardLayout>} />
            <Route path="/reviews/:id" element={<ReviewDetailPage />} />
            <Route path="/reviews/schedule" element={<ScheduleReviewPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
            <Route path="/projects" element={<DashboardLayout><ProjectsPage /></DashboardLayout>} />
            <Route path="/clients" element={<DashboardLayout><ClientsPage /></DashboardLayout>} />
            <Route path="/employees" element={<DashboardLayout><EmployeesPage /></DashboardLayout>} />
            <Route path="/reviews" element={<DashboardLayout><ReviewsPage /></DashboardLayout>} />
            <Route path="/reviews/:id" element={<ReviewDetailPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
