export interface Employee {
  id: string // FK to auth.users
  name: string
  national_id?: string
  is_manager?: boolean // Para identificar gerentes
  created_at?: string
}

export interface CreateUserData {
  email: string
  password: string
  name: string
  national_id?: string
  is_manager?: boolean
}

export interface Role {
  id: string
  name: string
  description?: string
}
