import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { reviewService } from '../services/review.service'
import type { CreateReviewData } from '../types/review.types'
import { supabase } from '@/lib/supabase'

interface Role {
  id: string
  name: string
  description: string | null
}

interface Project {
  id: string
  name: string
}

interface Employee {
  id: string
  name: string
  national_id?: string | null
  is_manager: boolean
  created_at: string
  id_profession?: string | null
  professions?: {
    name: string
  } | null
}

interface SelectedEmployee {
  id: string
  name: string
  profession: string
}

export const ScheduleReviewPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<Record<string, SelectedEmployee>>({})

  const [formData, setFormData] = useState({
    title: '',
    id_project: '',
    description: '',
    part: '',
    date: new Date().toISOString().split('T')[0],
    id_status: null as number | null
  })

  // Cargar proyectos y roles al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar proyectos
        setLoadingProjects(true)
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name')
          .order('name')

        if (projectsError) throw projectsError
        setProjects(projectsData || [])

        // Cargar roles (excluyendo admin y gerente)
        setLoadingRoles(true)
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('id, name, description')
          .not('name', 'in', '("admin","gerente","Admin","Gerente")')
          .order('name')

        if (rolesError) throw rolesError
        setRoles(rolesData || [])
      } catch (err) {
        console.error('Error al cargar datos:', err)
        setError('No se pudieron cargar los datos necesarios')
      } finally {
        setLoadingProjects(false)
        setLoadingRoles(false)
      }
    }

    fetchData()
  }, [])

  // Cargar empleados cuando se abre el modal
  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const { data, error: employeeError } = await supabase
        .from('employees')
        .select(`
          *,
          professions (
            name
          )
        `)
        .order('name')

      if (employeeError) throw employeeError
      setEmployees(data || [])
    } catch (err) {
      console.error('Error al cargar empleados:', err)
      setError('No se pudieron cargar los empleados')
    } finally {
      setLoadingEmployees(false)
    }
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    loadEmployees()
  }

  const handleSelectEmployee = (roleId: string, employee: Employee) => {
    setSelectedEmployees({
      ...selectedEmployees,
      [roleId]: {
        id: employee.id,
        name: employee.name,
        profession: employee.professions?.name || 'Sin profesión'
      }
    })
    setIsModalOpen(false)
  }

  const handleRemoveEmployee = (roleId: string) => {
    const newSelectedEmployees = { ...selectedEmployees }
    delete newSelectedEmployees[roleId]
    setSelectedEmployees(newSelectedEmployees)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      const reviewData: CreateReviewData = {
        ...formData,
        id_manager: user?.id || null
      }

      await reviewService.createReview(reviewData)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al programar la revisión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="bg-[#111822] border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              ← Volver
            </button>
            <div>
              <div className="text-gray-400 text-sm mb-1">
                Revisiones Técnicas / <span className="text-white">Programar Nueva Revisión</span>
              </div>
              <h1 className="text-white text-2xl font-bold">Programar Revisión Técnica Formal</h1>
              <p className="text-gray-400 text-sm mt-1">
                Define el alcance de la revisión, contexto del proyecto y asigna roles de participantes.
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Ver Guías
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - General Information & Logistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information */}
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-blue-500 text-xl">ℹ️</span>
                <h2 className="text-white text-lg font-bold">Información General</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Título de la Revisión
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="ej., Q4 API Architecture Review"
                    required
                    className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Selección de Proyecto
                    </label>
                    <select
                      value={formData.id_project}
                      onChange={(e) => setFormData({ ...formData, id_project: e.target.value })}
                      required
                      disabled={loadingProjects}
                      className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-[#1a2332]">
                        {loadingProjects ? 'Cargando proyectos...' : 'Selecciona un proyecto'}
                      </option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id} className="bg-[#1a2332]">
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Descripción de la Revisión
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalla los objetivos y requisitos de esta revisión técnica..."
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Logistics & Scope */}
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-blue-500 text-xl">📅</span>
                <h2 className="text-white text-lg font-bold">Logística y Alcance</h2>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Fecha de Revisión
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Parte a Revisar
                  </label>
                  <input
                    type="text"
                    value={formData.part}
                    onChange={(e) => setFormData({ ...formData, part: e.target.value })}
                    placeholder="ej., Módulo de autenticación, API de pagos..."
                    required
                    className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Participants */}
          <div className="space-y-6">
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500 text-xl">👥</span>
                <h2 className="text-white text-lg font-bold">Participantes</h2>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Asigna roles a los miembros del equipo para esta revisión.
              </p>

              <div className="space-y-4">
                {loadingRoles ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Cargando roles...
                  </div>
                ) : roles.length > 0 ? (
                  roles.map((role) => (
                    <div key={role.id} className="space-y-2">
                      {/* Botón para seleccionar empleado - solo si no hay empleado seleccionado */}
                      {!selectedEmployees[role.id] && (
                        <button
                          type="button"
                          onClick={handleOpenModal}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-colors"
                        >
                          <span>👤</span>
                          <span className="text-sm">Seleccionar Empleado</span>
                        </button>
                      )}

                      {/* Información del empleado seleccionado */}
                      {selectedEmployees[role.id] && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {selectedEmployees[role.id].name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate capitalize">
                              {selectedEmployees[role.id].name}
                            </p>
                            <p className="text-gray-400 text-xs truncate capitalize">
                              {selectedEmployees[role.id].profession}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmployee(role.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Eliminar empleado"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Información del rol */}
                      <div className="flex flex-col gap-1 px-4 py-3 rounded-lg border border-gray-700 bg-[#1a2332]">
                        <p className="text-sm font-medium text-white">{role.name}</p>
                        {role.description && (
                          <p className="text-xs text-gray-400">{role.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No hay roles disponibles
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <span>📅</span>
              <span>{loading ? 'Programando...' : 'Programar Revisión'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modal de Selección de Empleados */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h3 className="text-white text-xl font-bold">Seleccionar Empleado</h3>
                <p className="text-gray-400 text-sm mt-1">Elige un empleado para asignar al rol</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingEmployees ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  Cargando empleados...
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No hay empleados registrados
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Empleado</th>
                        <th className="px-6 py-4 font-semibold">Profesión</th>
                        <th className="px-6 py-4 font-semibold">Tipo</th>
                        <th className="px-6 py-4 font-semibold text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {employees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {employee.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white text-sm font-medium capitalize">
                                {employee.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm capitalize">
                            {employee.professions?.name || 'Sin profesión'}
                          </td>
                          <td className="px-6 py-4">
                            {employee.is_manager ? (
                              <span className="px-2 py-1 rounded text-[9px] font-bold uppercase bg-purple-500/10 text-purple-400">
                                GERENTE
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded text-[9px] font-bold uppercase bg-blue-500/10 text-blue-400">
                                EMPLEADO
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleSelectEmployee(roles[0]?.id || '', employee)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Seleccionar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
