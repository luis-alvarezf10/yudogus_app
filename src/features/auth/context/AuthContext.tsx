import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { authService } from '../services/auth.service'
import type { User, LoginCredentials } from '../types/auth.types'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check active session
    authService.getSession()
      .then((session) => {
        if (session?.user) {
          // Obtener información completa del usuario incluyendo is_manager
          authService.getCurrentUser().then((userData) => {
            if (userData) {
              setUser(userData)
            }
          })
        }
      })
      .catch((err) => {
        console.error('Error loading session:', err)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Obtener información completa del usuario incluyendo is_manager
        const userData = await authService.getCurrentUser()
        if (userData) {
          setUser(userData)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      const userData = await authService.login(credentials)
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      setError(null)
      await authService.logout()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
