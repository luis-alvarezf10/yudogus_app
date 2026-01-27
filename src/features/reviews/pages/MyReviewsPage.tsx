import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { REVIEW_STATUSES, DEFAULT_STATUS } from '../types/review.types'
import { formatDateWithOptions } from '@/lib/dateUtils'

interface Review {
  id: string
  title: string
  description: string
  part: string
  date: string
  id_status: number | null
  projects?: {
    name: string
  }
}

interface MyParticipation {
  id: string
  reviews: Review
  roles: {
    name: string
    description?: string
  }
}

export const MyReviewsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [participations, setParticipations] = useState<MyParticipation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    if (user?.id) {
      loadMyReviews()
    }
  }, [user, filter])

  const loadMyReviews = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('participants')
        .select(`
          id,
          reviews!inner (
            id,
            title,
            description,
            part,
            date,
            id_status,
            projects (
              name
            )
          ),
          roles (
            name,
            description
          )
        `)
        .eq('id_employee', user?.id)
        .order('reviews(date)', { ascending: false })

      // Aplicar filtros
      if (filter === 'pending') {
        query = query.is('reviews.id_status', null)
      } else if (filter === 'completed') {
        query = query.not('reviews.id_status', 'is', null)
      }

      const { data, error } = await query

      if (error) throw error
      setParticipations(data as any || [])
    } catch (err) {
      console.error('Error al cargar revisiones:', err)
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

  const formatDate = (dateString: string) => {
    return formatDateWithOptions(dateString, 'es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const isToday = (dateString: string) => {
    const today = new Date()
    
    // Dividir la fecha en partes para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number)
    
    return (
      year === today.getFullYear() &&
      month === today.getMonth() + 1 && // getMonth() devuelve 0-11, pero el string tiene 1-12
      day === today.getDate()
    )
  }

  const handleAttendReview = (e: React.MouseEvent, reviewId: string) => {
    e.stopPropagation()
    navigate(`/reviews/${reviewId}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-2">Mis Revisiones</h1>
        <p className="text-gray-400 text-sm">Revisiones donde participas como miembro del equipo</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-[#111822] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-[#111822] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-[#111822] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          Completadas
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Cargando revisiones...
        </div>
      ) : participations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <span className="text-6xl mb-4 block">📝</span>
          <p>No tienes revisiones {filter === 'pending' ? 'pendientes' : filter === 'completed' ? 'completadas' : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {participations.map((participation) => {
            const status = getStatusInfo(participation.reviews.id_status)
            const isTodayReview = isToday(participation.reviews.date)
            
            return (
              <div
                key={participation.id}
                onClick={() => navigate(`/reviews/${participation.reviews.id}`)}
                className="bg-[#111822] rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">{participation.reviews.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status.color)}`}>
                        {status.name}
                      </span>
                      {isTodayReview && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                          🔔 HOY
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{participation.reviews.description}</p>
                    
                    {/* Mi Rol */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <span className="text-blue-400 text-xs font-bold">MI ROL:</span>
                      <span className="text-blue-300 text-xs font-semibold uppercase">{participation.roles.name}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Proyecto:</span>
                    <p className="text-white">{participation.reviews.projects?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Parte:</span>
                    <p className="text-white">{participation.reviews.part}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fecha:</span>
                    <p className="text-white">{formatDate(participation.reviews.date)}</p>
                  </div>
                </div>

                {/* Botón de Asistir si es hoy */}
                {isTodayReview && (
                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={(e) => handleAttendReview(e, participation.reviews.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20"
                    >
                      <span className="text-xl">✓</span>
                      <span>Asistir a la Revisión</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
