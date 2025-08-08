export type ID = string

export type ProjectStatus = 'active' | 'archived'

export interface Project {
  id: ID
  name: string
  clientId: ID | null
  status: ProjectStatus
  ratePerHour?: number
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ClientContact {
  email?: string
  phone?: string
  website?: string
}

export interface Client {
  id: ID
  name: string
  company?: string
  contact: ClientContact
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  pageSize: number
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}