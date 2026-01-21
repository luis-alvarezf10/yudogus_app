import { supabase } from '@/lib/supabase'
import type { CreateUserData, Employee } from '../types/user.types'

export const userService = {
  // Create user in auth.users and employees table
  async createUser(userData: CreateUserData) {
    try {
      console.log('🔵 Iniciando creación de usuario:', userData.email)
      
      // Guardar la sesión actual del admin
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      // Create user in auth.users with metadata
      // The trigger will automatically create the employee entry
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name: userData.name,
            national_id: userData.national_id || null,
            is_manager: userData.is_manager || false,
          }
        }
      })

      if (authError) {
        console.error('❌ Error en signUp:', authError)
        throw authError
      }
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      console.log('✅ Usuario creado en auth.users:', authData.user.id)

      // Restaurar la sesión del admin inmediatamente
      if (currentSession) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token
        })
        console.log('✅ Sesión de admin restaurada')
      }

      // Retry logic to fetch the created employee (trigger might take time)
      let employeeData: Employee | null = null
      let attempts = 0
      const maxAttempts = 5

      while (!employeeData && attempts < maxAttempts) {
        attempts++
        console.log(`🔄 Intento ${attempts}/${maxAttempts} de obtener empleado...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts)) // Incremental backoff

        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (!error && data) {
          console.log('✅ Empleado encontrado por trigger:', data)
          employeeData = data as Employee
          break
        }

        console.log(`⚠️ Intento ${attempts} falló:`, error)

        if (attempts === maxAttempts) {
          console.log('🔧 Intentando inserción manual como fallback...')
          
          // Try to insert manually as fallback
          const { data: insertedData, error: insertError } = await supabase
            .from('employees')
            .insert({
              id: authData.user.id,
              name: userData.name,
              national_id: userData.national_id || null,
              is_manager: userData.is_manager || false,
            })
            .select()
            .single()

          if (insertError) {
            console.error('❌ Inserción manual falló:', insertError)
            console.error('❌ Detalles completos del error:', JSON.stringify(insertError, null, 2))
            throw new Error(`Error al crear empleado: ${insertError.message || 'Error desconocido'}`)
          }

          console.log('✅ Empleado creado manualmente:', insertedData)
          employeeData = insertedData as Employee
        }
      }

      return employeeData!
    } catch (error) {
      console.error('❌ Error general en createUser:', error)
      throw error
    }
  },

  // Get all employees
  async getEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Employee[]
  },

  // Get employee by id
  async getEmployeeById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Employee
  },

  // Update employee
  async updateEmployee(id: string, updates: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Employee
  },

  // Delete employee
  async deleteEmployee(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
