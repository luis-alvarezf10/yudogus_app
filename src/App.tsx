import { useAuth } from './features/auth'
import { LoginPage } from './features/auth'
import { DashboardPage, ManagerDashboardPage } from './features/dashboard'

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

  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Mostrar dashboard de gerente si is_manager es true
  if (user?.is_manager) {
    return <ManagerDashboardPage />
  }

  // Mostrar dashboard normal para empleados regulares
  return <DashboardPage />
}

export default App
