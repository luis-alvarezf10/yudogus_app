import { supabase } from '@/lib/supabase'
import type { LoginCredentials, User } from '../types/auth.types'

export const authService = {
  async login({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    // Obtener información del empleado desde la tabla employees
    const { data: employeeData } = await supabase
      .from('employees')
      .select('name, is_manager')
      .eq('id', data.user.id)
      .single()
    
    return {
      id: data.user.id,
      email: data.user.email!,
      name: employeeData?.name,
      is_manager: employeeData?.is_manager || false,
      created_at: data.user.created_at
    } as User
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    
    // Obtener información del empleado desde la tabla employees
    const { data: employeeData } = await supabase
      .from('employees')
      .select('name, is_manager')
      .eq('id', user.id)
      .single()
    
    return {
      id: user.id,
      email: user.email!,
      name: employeeData?.name,
      is_manager: employeeData?.is_manager || false,
      created_at: user.created_at
    } as User
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }
}
