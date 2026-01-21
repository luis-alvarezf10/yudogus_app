import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'

interface StatCard {
  title: string
  value: string | number
  icon: string
  change: string
  changeType: 'positive' | 'negative'
  subtitle: string
}

interface Review {
  id: string
  title: string
  project: string
  leadReviewer: string
  date: string
  status: 'completed' | 'in-progress' | 'scheduled'
}

interface Employee {
  id: string
  name: string
  role: string
  status: 'online' | 'offline' | 'busy'
  avatar?: string
}

export const ManagerDashboardPage = () => {
  const [stats] = useState<StatCard[]>([
    {
      title: 'Proyectos Activos',
      value: 12,
      icon: '📊',
      change: '+2%',
      changeType: 'positive',
      subtitle: 'vs mes anterior'
    },
    {
      title: 'Horas Facturables',
      value: '1,240',
      icon: '⏰',
      change: '-5%',
      changeType: 'negative',
      subtitle: 'vs mes anterior'
    },
    {
      title: 'Revisiones Pendientes',
      value: '05',
      icon: '✓',
      change: '-10%',
      changeType: 'negative',
      subtitle: 'vs semana anterior'
    },
    {
      title: 'Satisfacción',
      value: '98%',
      icon: '😊',
      change: '+1%',
      changeType: 'positive',
      subtitle: 'objetivo 95%'
    }
  ])

  const [reviews] = useState<Review[]>([
    {
      id: '1',
      title: 'Auditoría de Seguridad API',
      project: 'Sentinel Gateway',
      leadReviewer: 'Sarah Chen',
      date: '24 Oct, 2023',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Revisión Refactor Frontend',
      project: 'Core UI 2.0',
      leadReviewer: 'Marcus Thorne',
      date: '22 Oct, 2023',
      status: 'in-progress'
    },
    {
      id: '3',
      title: 'Actualización Schema Base de Datos',
      project: 'Inventory Pro',
      leadReviewer: 'Elena Rodriguez',
      date: '20 Oct, 2023',
      status: 'in-progress'
    },
    {
      id: '4',
      title: 'Auditoría Cluster Kubernetes',
      project: 'DevOps Pipeline',
      leadReviewer: 'Marcus Thorne',
      date: '18 Oct, 2023',
      status: 'scheduled'
    }
  ])

  const [employees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Arquitecta Principal',
      status: 'online'
    },
    {
      id: '2',
      name: 'Marcus Thorne',
      role: 'Ingeniero DevOps',
      status: 'online'
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      role: 'Líder QA Senior',
      status: 'offline'
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Desarrollador Backend Sr.',
      status: 'busy'
    }
  ])

  const getStatusBadge = (status: Review['status']) => {
    const styles = {
      completed: 'bg-green-500/10 text-green-500',
      'in-progress': 'bg-blue-500/20 text-blue-500',
      scheduled: 'bg-amber-500/10 text-amber-500'
    }

    const labels = {
      completed: 'COMPLETADO',
      'in-progress': 'EN PROGRESO',
      scheduled: 'PROGRAMADO'
    }

    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getStatusIndicator = (status: Employee['status']) => {
    const colors = {
      online: 'bg-green-500',
      offline: 'border border-gray-500',
      busy: 'bg-orange-500'
    }

    return <span className={`w-2 h-2 rounded-full ${colors[status]}`}></span>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1a]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-800 bg-[#111822] px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="text-blue-500 text-2xl">📊</div>
            <h2 className="text-white text-xl font-bold">Panel de Control</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-[#233348] border-none rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                placeholder="Buscar proyectos..."
                type="text"
              />
            </div>

            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-[#233348] text-gray-400 hover:text-white relative">
                <span className="text-xl">🔔</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#111822]"></span>
              </button>
              <button className="p-2 rounded-lg bg-[#233348] text-gray-400 hover:text-white">
                <span className="text-xl">👤</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-xl p-6 bg-[#111822] border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <p className="text-white text-3xl font-bold">{stat.value}</p>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs font-bold ${
                      stat.changeType === 'positive' ? 'text-green-500' : 'text-orange-500'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-gray-400 text-[10px]">{stat.subtitle}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-white text-xl font-bold">Revisiones Técnicas Formales Recientes</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                  <span className="text-lg">+</span>
                  <span>Crear Nueva Revisión</span>
                </button>
              </div>

              <div className="bg-[#111822] rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Título de Revisión</th>
                      <th className="px-6 py-4 font-semibold">Revisor Principal</th>
                      <th className="px-6 py-4 font-semibold">Fecha</th>
                      <th className="px-6 py-4 font-semibold text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {reviews.map((review) => (
                      <tr
                        key={review.id}
                        className="hover:bg-gray-800/20 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-medium group-hover:text-blue-500 transition-colors">
                              {review.title}
                            </span>
                            <span className="text-gray-400 text-xs">Proyecto: {review.project}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{review.leadReviewer}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{review.date}</td>
                        <td className="px-6 py-4 text-right">{getStatusBadge(review.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Employees Sidebar */}
            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold px-2">Empleados de la Empresa</h2>
              <div className="bg-[#111822] rounded-xl border border-gray-800 p-4 flex flex-col gap-4">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-white text-sm font-semibold">{employee.name}</span>
                      <span className="text-gray-400 text-xs">{employee.role}</span>
                    </div>
                    {getStatusIndicator(employee.status)}
                  </div>
                ))}

                <button className="w-full mt-2 py-2 text-gray-400 text-xs font-medium hover:text-white transition-colors border-t border-gray-800 pt-4">
                  Ver Directorio Completo
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
