import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CreateUserData } from '../types/user.types'

interface CreateUserFormProps {
  onSubmit: (data: CreateUserData) => Promise<void>
  loading?: boolean
  error?: string | null
}

export const CreateUserForm = ({ onSubmit, loading, error }: CreateUserFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    national_id: '',
    is_manager: false
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      // Reset form on success
      setFormData({ 
        email: '', 
        password: '', 
        name: '', 
        national_id: '',
        is_manager: false
      })
    } catch (err) {
      console.error('Error creating user:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Juan Pérez"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="juan@empresa.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Contraseña"
        />
      </div>

      <div>
        <label htmlFor="national_id" className="block text-sm font-medium text-gray-700 mb-1">
          Cédula (Opcional)
        </label>
        <input
          id="national_id"
          type="text"
          value={formData.national_id}
          onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1234567890"
        />
      </div>

      <div className="flex items-center">
        <input
          id="is_manager"
          type="checkbox"
          checked={formData.is_manager}
          onChange={(e) => setFormData({ ...formData, is_manager: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_manager" className="ml-2 block text-sm text-gray-700">
          Es gerente (puede gestionar proyectos)
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creando empleado...' : 'Crear Empleado'}
      </button>
    </form>
  )
}
