export interface User {
  id: string
  email: string
  username?: string
  name?: string
  is_manager?: boolean
  created_at?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}
