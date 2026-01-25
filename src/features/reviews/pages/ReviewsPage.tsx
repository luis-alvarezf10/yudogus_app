import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { REVIEW_STATUSES, DEFAULT_STATUS } from '../types/review.types'

interface Review {
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

export const ReviewsPage = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
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
        .order('date', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (err) {
      console.error('Error al cargar revisiones:', err)
      setError('No se pudieron cargar las revisiones')
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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold mb-2">Revisiones Técnicas</h1>
          <p className="text-gray-400 text-sm">Todas las revisiones técnicas formales</p>
        </div>
        <button 
          onClick={() => navigate('/reviews/schedule')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-lg">+</span>
          <span>Crear Revisión</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Cargando revisiones...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <span className="text-6xl mb-4 block">📝</span>
          <p>No hay revisiones registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const status = getStatusInfo(review.id_status)
            return (
              <div
                key={review.id}
                onClick={() => navigate(`/reviews/${review.id}`)}
                className="bg-[#111822] rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">{review.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status.color)}`}>
                        {status.name}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{review.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Proyecto:</span>
                        <p className="text-white">{review.projects?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Parte:</span>
                        <p className="text-white">{review.part}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Gerente:</span>
                        <p className="text-white capitalize">{review.employees?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-500 text-xs mb-1">Fecha de revisión</p>
                    <p className="text-white font-semibold">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
