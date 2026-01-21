import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { UsersPage } from '@/features/users'

export const DashboardPage = () => {
  const { user, logout, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<'home' | 'users'>('home')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Sistema de Revisión Técnica
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={logout}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Usuarios
          </button>
        </div>

        {activeTab === 'home' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Bienvenido! 🎉
            </h2>
            <p className="text-gray-600">
              Has iniciado sesión correctamente. Aquí podrás gestionar tus revisiones técnicas.
            </p>
          </div>
        ) : (
          <UsersPage />
        )}
      </div>
    </div>
  )
}
