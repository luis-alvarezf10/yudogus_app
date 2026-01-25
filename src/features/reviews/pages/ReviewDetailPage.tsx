import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { REVIEW_STATUSES, DEFAULT_STATUS } from '../types/review.types'

interface ReviewDetail {
  id: string
  title: string
  description: string
  part: string
  date: string
  id_status: number | null
  created_at: string
  projects?: {
    name: string
  }
  employees?: {
    name: string
  }
}

interface Participant {
  id: string
  employees: {
    id: string
    name: string
    professions?: {
      name: string
    } | null
  } | null
  roles: {
    id: string
    name: string
    description?: string | null
  } | null
}

export const ReviewDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [review, setReview] = useState<ReviewDetail | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadReviewDetails()
    }
  }, [id])

  const loadReviewDetails = async () => {
    try {
      setLoading(true)
      
      // Cargar detalles de la revisión
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select(`
          *,
          projects (
            name
          ),
          employees!reviews_id_manager_fkey (
            name
          )
        `)
        .eq('id', id)
        .single()

      if (reviewError) throw reviewError
      setReview(reviewData)

      // Cargar participantes con sus roles
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select(`
          id,
          employees (
            id,
            name,
            professions (
              name
            )
          ),
          roles (
            id,
            name,
            description
          )
        `)
        .eq('id_review', id)

      if (participantsError) throw participantsError
      setParticipants(participantsData as any || [])
    } catch (err) {
      console.error('Error al cargar detalles:', err)
      setError('No se pudieron cargar los detalles de la revisión')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (statusId: number | null) => {
    if (statusId === null) return DEFAULT_STATUS
    return REVIEW_STATUSES[statusId] || DEFAULT_STATUS
  }

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500/10 text-green-400 border-green-500/30',
      red: 'bg-red-500/10 text-red-400 border-red-500/30',
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      gray: 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
    return colors[color] || colors.gray
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Cargando detalles...
        </div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <p className="text-red-400 mb-4">{error || 'Revisión no encontrada'}</p>
          <button
            onClick={() => navigate('/reviews')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Revisiones
          </button>
        </div>
      </div>
    )
  }

  const status = getStatusInfo(review.id_status)

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="bg-[#111822] border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/reviews')}
              className="text-gray-400 hover:text-white"
            >
              ← Volver
            </button>
            <div className="flex-1">
              <div className="text-gray-400 text-sm mb-1">
                Revisiones / <span className="text-white">Detalles</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-white text-2xl font-bold">{review.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status.color)}`}>
                  {status.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles de la Revisión */}
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500 text-xl">📋</span>
                <h2 className="text-white text-lg font-bold">Información de la Revisión</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Descripción</label>
                  <p className="text-white mt-1">{review.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Proyecto</label>
                    <p className="text-white mt-1">{review.projects?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Parte a Revisar</label>
                    <p className="text-white mt-1">{review.part}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Fecha de Revisión</label>
                    <p className="text-white mt-1">
                      {new Date(review.date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Gerente Responsable</label>
                    <p className="text-white mt-1 capitalize">{review.employees?.name || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Estado</label>
                  <p className="text-white mt-1">{status.description}</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Fecha de Creación</label>
                  <p className="text-white mt-1">
                    {new Date(review.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-6">
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500 text-xl">👥</span>
                <h2 className="text-white text-lg font-bold">Participantes</h2>
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No hay participantes asignados
                </div>
              ) : (
                <div className="space-y-4">
                  {participants.map((participant) => {
                    if (!participant.employees || !participant.roles) return null
                    
                    return (
                      <div
                        key={participant.id}
                        className="p-4 rounded-lg bg-[#1a2332] border border-gray-700"
                      >
                        {/* Empleado */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {participant.employees.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate capitalize">
                              {participant.employees.name}
                            </p>
                            <p className="text-gray-400 text-xs truncate capitalize">
                              {participant.employees.professions?.name || 'Sin profesión'}
                            </p>
                          </div>
                        </div>

                        {/* Rol */}
                        <div className="pt-3 border-t border-gray-700">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-400 text-xs font-bold uppercase">
                              {participant.roles.name}
                            </span>
                          </div>
                          {participant.roles.description && (
                            <p className="text-gray-400 text-xs">
                              {participant.roles.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
