import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Employee {
  id: string
  name: string
  national_id?: string
  is_manager: boolean
  created_at: string
  professions?: {
    name: string
  }
}

interface EmployeeReview {
  id: string
  role: string
  reviews: {
    id: string
    title: string
    description: string
    date: string
    part: string
    projects: {
      name: string
    }
    review_statuses: {
      name: string
    } | null
  }
  roles: {
    name: string
  }
}

export const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeReviews, setEmployeeReviews] = useState<EmployeeReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          professions (
            name
          )
        `)
        .eq('is_manager', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmployees(data || [])
    } catch (err) {
      console.error('Error al cargar empleados:', err)
      setError('No se pudieron cargar los empleados')
    } finally {
      setLoading(false)
    }
  }

  const loadEmployeeReviews = async (employeeId: string) => {
    try {
      setLoadingReviews(true)
      
      // Primero obtener los participantes
      const { data, error } = await supabase
        .from('participants')
        .select(`
          id,
          role,
          id_review
        `)
        .eq('id_employee', employeeId)

      console.log('Participantes encontrados:', data)

      if (error) throw error

      if (!data || data.length === 0) {
        setEmployeeReviews([])
        return
      }

      // Obtener los IDs de revisiones y roles
      const reviewIds = data.map(p => p.id_review)
      const roleIds = data.map(p => p.role)

      // Obtener las revisiones (sin relaciones anidadas)
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, title, description, date, part, id_project, id_status')
        .in('id', reviewIds)

      console.log('Revisiones encontradas:', reviewsData)

      if (reviewsError) {
        console.error('Error en revisiones:', reviewsError)
        throw reviewsError
      }

      // Obtener los roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('id, name')
        .in('id', roleIds)

      console.log('Roles encontrados:', rolesData)

      if (rolesError) {
        console.error('Error en roles:', rolesError)
        throw rolesError
      }

      // Obtener los proyectos
      const projectIds = reviewsData?.map(r => r.id_project).filter(Boolean) || []
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name')
        .in('id', projectIds)

      console.log('Proyectos encontrados:', projectsData)

      // Obtener los estados
      const statusIds = reviewsData?.map(r => r.id_status).filter(Boolean) || []
      const { data: statusesData } = await supabase
        .from('review_statuses')
        .select('id, name')
        .in('id', statusIds)

      console.log('Estados encontrados:', statusesData)

      // Combinar los datos
      const transformedData: EmployeeReview[] = data.map(participant => {
        const review = reviewsData?.find(r => r.id === participant.id_review)
        const role = rolesData?.find(r => r.id === participant.role)
        const project = projectsData?.find(p => p.id === review?.id_project)
        const status = statusesData?.find(s => s.id === review?.id_status)

        return {
          id: participant.id,
          role: participant.role,
          reviews: {
            id: review?.id || '',
            title: review?.title || '',
            description: review?.description || '',
            date: review?.date || '',
            part: review?.part || '',
            projects: {
              name: project?.name || 'Sin proyecto'
            },
            review_statuses: status ? { name: status.name } : null
          },
          roles: {
            name: role?.name || 'Sin rol'
          }
        }
      })

      console.log('Datos transformados:', transformedData)
      setEmployeeReviews(transformedData)
    } catch (err) {
      console.error('Error al cargar revisiones del empleado:', err)
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleEmployeeClick = async (employee: Employee) => {
    setSelectedEmployee(employee)
    await loadEmployeeReviews(employee.id)
  }

  const handleCloseModal = () => {
    setSelectedEmployee(null)
    setEmployeeReviews([])
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold mb-2">Empleados</h1>
          <p className="text-gray-400 text-sm">Gestiona todos los empleados de la empresa</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Cargando empleados...
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <span className="text-6xl mb-4 block">👤</span>
          <p>No hay empleados registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              onClick={() => handleEmployeeClick(employee)}
              className="bg-[#111822] rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold truncate capitalize">{employee.name}</h3>
                    {employee.is_manager && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-500/10 text-purple-400">
                        Gerente
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm capitalize">
                    {employee.professions?.name || 'Sin profesión'}
                  </p>
                  {employee.national_id && (
                    <p className="text-gray-500 text-xs mt-1">ID: {employee.national_id}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    Registrado: {new Date(employee.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Información del Empleado */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {selectedEmployee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white text-2xl font-bold capitalize">{selectedEmployee.name}</h3>
                  <p className="text-gray-400 text-sm capitalize">
                    {selectedEmployee.professions?.name || 'Sin profesión'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Información del Empleado */}
              <div className="bg-[#1a2332] rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span>📋</span>
                  Información Personal
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedEmployee.national_id && (
                    <div>
                      <p className="text-gray-400">Identificación</p>
                      <p className="text-white font-medium">{selectedEmployee.national_id}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400">Fecha de Registro</p>
                    <p className="text-white font-medium">
                      {new Date(selectedEmployee.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tipo</p>
                    <p className="text-white font-medium">
                      {selectedEmployee.is_manager ? 'Gerente' : 'Empleado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Revisiones Asignadas */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span>📝</span>
                  Revisiones Asignadas ({employeeReviews.length})
                </h4>

                {loadingReviews ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando revisiones...
                  </div>
                ) : employeeReviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-[#1a2332] rounded-lg">
                    <span className="text-4xl mb-2 block">📭</span>
                    <p>No tiene revisiones asignadas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employeeReviews.map((participation) => (
                      <div
                        key={participation.id}
                        className="bg-[#1a2332] rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h5 className="text-white font-semibold mb-1">
                              {participation.reviews.title}
                            </h5>
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {participation.reviews.description}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 whitespace-nowrap">
                            {participation.roles.name}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-gray-500 mb-1">Proyecto</p>
                            <p className="text-white font-medium truncate">
                              {participation.reviews.projects.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Parte</p>
                            <p className="text-white font-medium truncate">
                              {participation.reviews.part}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Fecha</p>
                            <p className="text-white font-medium">
                              {new Date(participation.reviews.date).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Estado</p>
                            <p className="text-white font-medium">
                              {participation.reviews.review_statuses?.name || 'En Espera'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
