import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface Client {
  id: string
  name: string
}

export const CreateProjectPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    id_client: '',
    client_name: ''
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoadingClients(true)
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (err) {
      console.error('Error al cargar clientes:', err)
      setError('No se pudieron cargar los clientes')
    } finally {
      setLoadingClients(false)
    }
  }

  const handleSelectClient = (client: Client) => {
    setFormData({
      ...formData,
      id_client: client.id,
      client_name: client.name
    })
    setIsClientModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          id_client: formData.id_client
        })

      if (insertError) throw insertError

      navigate('/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="bg-[#111822] border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="text-gray-400 hover:text-white"
            >
              ← Volver
            </button>
            <div>
              <div className="text-gray-400 text-sm mb-1">
                Proyectos / <span className="text-white">Crear Nuevo Proyecto</span>
              </div>
              <h1 className="text-white text-2xl font-bold">Crear Proyecto</h1>
              <p className="text-gray-400 text-sm mt-1">
                Registra un nuevo proyecto en el sistema
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Proyecto */}
          <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-blue-500 text-xl">📁</span>
              <h2 className="text-white text-lg font-bold">Información del Proyecto</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej., Sistema de Gestión de Inventario"
                  required
                  className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Cliente *
                </label>
                {!formData.id_client ? (
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(true)}
                    disabled={loadingClients}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>👥</span>
                    <span className="text-sm">
                      {loadingClients ? 'Cargando clientes...' : 'Seleccionar Cliente'}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {formData.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate capitalize">
                        {formData.client_name}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        Cliente seleccionado
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, id_client: '', client_name: '' })}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="Eliminar cliente"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <span>📁</span>
              <span>{loading ? 'Creando...' : 'Crear Proyecto'}</span>
            </button>
          </div>
        </form>
      </main>

      {/* Modal de Selección de Clientes */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h3 className="text-white text-xl font-bold">Seleccionar Cliente</h3>
                <p className="text-gray-400 text-sm mt-1">Elige el cliente para este proyecto</p>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingClients ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  Cargando clientes...
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No hay clientes registrados
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className="flex items-center gap-4 p-4 rounded-lg bg-[#1a2332] border border-gray-700 hover:border-blue-500 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold capitalize">{client.name}</p>
                      </div>
                      <span className="text-blue-500">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
