import { useState } from 'react'
import { useAuth } from '@/features/auth'

interface MenuItem {
  id: string
  label: string
  icon: string
  active?: boolean
}

export const Sidebar = () => {
  const { user, logout } = useAuth()
  const [activeItem, setActiveItem] = useState('dashboard')

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Panel de Control', icon: '📊' },
    { id: 'projects', label: 'Proyectos', icon: '💼' },
    { id: 'clients', label: 'Clientes', icon: '👥' },
    { id: 'employees', label: 'Empleados', icon: '👤' },
    { id: 'reviews', label: 'Revisiones', icon: '📝' },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <aside className="w-64 flex flex-col bg-[#111822] border-r border-[#233348] h-screen">
      {/* Logo/Header */}
      <div className="p-6 flex flex-col gap-1 border-b border-[#233348]">
        <h1 className="text-white text-lg font-bold leading-normal">Yudagus App</h1>
        <p className="text-[#92a9c9] text-xs font-normal">Sistema de Gestión</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-[#233348]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeItem === item.id
                ? 'bg-blue-600 text-white'
                : 'text-[#92a9c9] hover:text-white hover:bg-[#233348]'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <p className="text-sm font-medium">{item.label}</p>
          </div>
        ))}
      </nav>

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
  )
}
