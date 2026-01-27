import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { supabase } from '@/lib/supabase'

interface Employee {
  id: string
  name: string
  national_id?: string | null
  is_manager: boolean
  id_profession?: string | null
  professions?: {
    id: string
    name: string
  } | null
}

interface Profession {
  id: string
  name: string
}

export const SettingsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Datos del empleado
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [employeeName, setEmployeeName] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [selectedProfession, setSelectedProfession] = useState('')
  
  // Datos del usuario (auth)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Profesiones disponibles
  const [professions, setProfessions] = useState<Profession[]>([])
  const [addProfessionModalOpen, setAddProfessionModalOpen] = useState(false)
  const [newProfessionName, setNewProfessionName] = useState('')
  const [addingProfession, setAddingProfession] = useState(false)
  const [addProfessionError, setAddProfessionError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Cargar datos del empleado
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select(`
          *,
          professions (
            id,
            name
          )
        `)
        .eq('id', user.id)
        .single()

      if (employeeError) throw employeeError

      setEmployee(employeeData)
      setEmployeeName(employeeData.name || '')
      setNationalId(employeeData.national_id || '')
      
      const professionData = Array.isArray(employeeData.professions)
        ? employeeData.professions[0]
        : employeeData.professions
      
      setSelectedProfession(professionData?.id || '')
      setEmail(user.email || '')

      // Cargar profesiones disponibles
      const { data: professionsData, error: professionsError } = await supabase
        .from('professions')
        .select('*')
        .order('name')

      if (professionsError) throw professionsError
      setProfessions(professionsData || [])

    } catch (err) {
      console.error('Error loading data:', err)
      setError('No se pudieron cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Actualizar datos del empleado
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          name: employeeName.trim(),
          national_id: nationalId.trim() || null,
          id_profession: selectedProfession || null
        })
        .eq('id', user?.id)

      if (updateError) throw updateError

      setSuccess('Perfil actualizado correctamente')
      
      // Recargar datos
      await loadData()
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('No se pudo actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Validaciones
      if (!newPassword || !confirmPassword) {
        throw new Error('Debes completar todos los campos de contraseña')
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      if (newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      // Actualizar contraseña
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (passwordError) throw passwordError

      setSuccess('Contraseña actualizada correctamente')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Error changing password:', err)
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  const handleAddProfession = async () => {
    try {
      setAddingProfession(true)
      setAddProfessionError(null)

      if (!newProfessionName.trim()) {
        throw new Error('El nombre de la profesión es requerido')
      }

      // Crear la nueva profesión
      const { data, error: createError } = await supabase
        .from('professions')
        .insert([{ name: newProfessionName.trim() }])
        .select()
        .single()

      if (createError) throw createError

      // Agregar a la lista de profesiones
      setProfessions([...professions, data])

      // Seleccionar automáticamente la nueva profesión
      setSelectedProfession(data.id)

      // Cerrar modal y limpiar
      setAddProfessionModalOpen(false)
      setNewProfessionName('')
      setSuccess('Profesión creada correctamente')
    } catch (err) {
      console.error('Error adding profession:', err)
      setAddProfessionError(err instanceof Error ? err.message : 'No se pudo crear la profesión')
    } finally {
      setAddingProfession(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Cargando configuración...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="bg-[#111822] border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white"
            >
              ← Volver
            </button>
            <div>
              <div className="text-gray-400 text-sm mb-1">
                Configuración
              </div>
              <h1 className="text-white text-2xl font-bold">Mi Perfil</h1>
              <p className="text-gray-400 text-sm mt-1">
                Gestiona tu información personal y configuración de cuenta
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6">
        {/* Mensajes */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Información Personal */}
          <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-blue-500 text-xl">👤</span>
              <h2 className="text-white text-lg font-bold">Información Personal</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Identificación Nacional
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cédula o documento de identidad"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Profesión
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedProfession}
                    onChange={(e) => setSelectedProfession(e.target.value)}
                    className="flex-1 px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar profesión</option>
                    {professions.map((profession) => (
                      <option key={profession.id} value={profession.id}>
                        {profession.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setAddProfessionModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    title="Agregar nueva profesión"
                  >
                    <span>+</span>
                    <span className="hidden sm:inline">Nueva</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tipo de Usuario
                </label>
                <div className="px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    employee?.is_manager 
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {employee?.is_manager ? 'GERENTE' : 'EMPLEADO'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !employeeName.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Información de Cuenta */}
          <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-blue-500 text-xl">📧</span>
              <h2 className="text-white text-lg font-bold">Información de Cuenta</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-gray-500 text-xs mt-1">
                  El correo electrónico no se puede modificar
                </p>
              </div>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-blue-500 text-xl">🔒</span>
              <h2 className="text-white text-lg font-bold">Cambiar Contraseña</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repite la nueva contraseña"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !newPassword || !confirmPassword}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <span>🔑</span>
                      <span>Cambiar Contraseña</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para Agregar Profesión */}
        {addProfessionModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-2xl">
                    ➕
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">Agregar Profesión</h3>
                    <p className="text-gray-400 text-sm">Crea una nueva profesión</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Nombre de la Profesión
                  </label>
                  <input
                    type="text"
                    value={newProfessionName}
                    onChange={(e) => setNewProfessionName(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Ingeniero de Software"
                    autoFocus
                  />
                </div>

                {addProfessionError && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {addProfessionError}
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setAddProfessionModalOpen(false)
                      setNewProfessionName('')
                      setAddProfessionError(null)
                    }}
                    disabled={addingProfession}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddProfession}
                    disabled={addingProfession || !newProfessionName.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {addingProfession ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>Crear Profesión</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
