/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, LoginCredentials } from '../types/auth.types'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }
        
        if (!mounted) return

        if (session?.user) {
          try {
            // Intentar cargar datos de empleado con timeout
            const queryPromise = supabase
              .from('employees')
              .select('name, is_manager')
              .eq('id', session.user.id)
              .single()

            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Query timeout')), 5000)
            )

            const { data: employeeData } = await Promise.race([
              queryPromise,
              timeoutPromise
            ]) as any

            if (mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: employeeData?.name || session.user.email?.split('@')[0] || 'Usuario',
                is_manager: employeeData?.is_manager || false,
                created_at: session.user.created_at
              })
            }
          } catch {
            // Si falla, usar datos básicos
            if (mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.email?.split('@')[0] || 'Usuario',
                is_manager: false,
                created_at: session.user.created_at
              })
            }
          }
        } else {
          if (mounted) {
            setUser(null)
          }
        }
      } catch {
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Para SIGNED_IN, usar timeout más corto ya que INITIAL_SESSION vendrá después
      const timeoutMs = event === 'SIGNED_IN' ? 2000 : 5000

      if (session?.user) {
        try {
          const queryPromise = supabase
            .from('employees')
            .select('name, is_manager')
            .eq('id', session.user.id)
            .single()

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
          )

          const { data: employeeData } = await Promise.race([
            queryPromise,
            timeoutPromise
          ]) as any

          if (mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: employeeData?.name || session.user.email?.split('@')[0] || 'Usuario',
              is_manager: employeeData?.is_manager || false,
              created_at: session.user.created_at
            })
            setLoading(false)
          }
        } catch {
          // Si es SIGNED_IN y falla, no hacer nada (esperar INITIAL_SESSION)
          if (event === 'SIGNED_IN') {
            return
          }
          
          // Para otros eventos, usar datos básicos
          if (mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.email?.split('@')[0] || 'Usuario',
              is_manager: false,
              created_at: session.user.created_at
            })
            setLoading(false)
          }
        }
      } else {
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null)
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })
      
      if (authError) throw authError
      
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name, is_manager')
        .eq('id', data.user.id)
        .single()
      
      setUser({
        id: data.user.id,
        email: data.user.email!,
        name: employeeData?.name || data.user.email?.split('@')[0] || 'Usuario',
        is_manager: employeeData?.is_manager || false,
        created_at: data.user.created_at
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión')
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
