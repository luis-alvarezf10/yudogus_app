import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'

interface MenuItem {
  id: string
  label: string
  icon: string
  path: string
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Panel de Control', icon: '📊', path: '/dashboard' },
    { id: 'projects', label: 'Proyectos', icon: '💼', path: '/projects' },
    { id: 'clients', label: 'Clientes', icon: '👥', path: '/clients' },
    { id: 'employees', label: 'Empleados', icon: '👤', path: '/employees' },
    { id: 'reviews', label: 'Revisiones', icon: '📝', path: '/reviews' },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleMenuItemClick = (item: MenuItem) => {
    navigate(item.path)
    onClose() // Cerrar sidebar en móvil al hacer clic
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 flex flex-col bg-[#111822] border-r border-[#233348] h-screen
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-white text-lg font-bold leading-normal">Yudagus App</h1>
            <p className="text-[#92a9c9] text-xs font-normal">Software Reviews</p>
          </div>
          {/* Botón cerrar para móvil */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>


        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuItemClick(item)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-[#92a9c9] hover:text-white hover:bg-[#233348]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <p className="text-sm font-medium">{item.label}</p>
            </div>
          ))}
        </nav>

        {/* User Info */}
        {user && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-white text-sm font-semibold truncate">
                  {user.name || user.email}
                </span>
                <span className="text-[#92a9c9] text-xs truncate">
                  {user.is_manager ? 'Gerente' : 'Empleado'}
                </span>
              </div>
            </div>
          </div>
        )}
        {/* Footer Actions */}
        <div className="p-4 border-t border-[#233348] space-y-2">
          <button className="w-full flex items-center justify-center gap-2 rounded-lg h-10 bg-[#233348] text-white text-sm font-bold hover:bg-[#2d415a] transition-colors">
            <span className="text-lg">⚙️</span>
            <span>Configuración</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg h-10 bg-red-600/10 text-red-500 text-sm font-bold hover:bg-red-600/20 transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
