import { Client, ID, PagedResult, Pagination, Project, ProjectStatus } from '../lib/types'

const STORAGE_KEY = 'timeflow.mockdb.v1'

interface DbSchema {
  clients: Record<ID, Client>
  projects: Record<ID, Project>
}

function loadDb(): DbSchema {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) return JSON.parse(raw) as DbSchema
  const seed = seedDb()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}

function saveDb(db: DbSchema) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

function nowIso() {
  return new Date().toISOString()
}

function createId() {
  return crypto.randomUUID()
}

function seedDb(): DbSchema {
  const c1: Client = {
    id: createId(),
    name: 'Acme Corp',
    company: 'Acme Corp',
    contact: { email: 'hello@acme.com', phone: '+1 555 000', website: 'https://acme.com' },
    notes: 'VIP client',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  const c2: Client = {
    id: createId(),
    name: 'Globex',
    company: 'Globex LLC',
    contact: { email: 'info@globex.io' },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  const p1: Project = {
    id: createId(),
    name: 'Website Redesign',
    clientId: c1.id,
    status: 'active',
    ratePerHour: 95,
    tags: ['web', 'design'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    notes: 'Priority Q3',
  }
  const p2: Project = {
    id: createId(),
    name: 'Mobile App',
    clientId: c1.id,
    status: 'active',
    ratePerHour: 120,
    tags: ['mobile'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  const p3: Project = {
    id: createId(),
    name: 'Consulting Retainer',
    clientId: c2.id,
    status: 'archived',
    tags: ['consulting'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  return {
    clients: { [c1.id]: c1, [c2.id]: c2 },
    projects: { [p1.id]: p1, [p2.id]: p2, [p3.id]: p3 },
  }
}

function simulate<T>(result: T, ms = 200): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(result), ms))
}

export type SortDir = 'asc' | 'desc'

function textIncludes(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

export const api = {
  async listClients(query: string, { page, pageSize }: Pagination): Promise<PagedResult<Client>> {
    const db = loadDb()
    const all = Object.values(db.clients)
    const filtered = query
      ? all.filter(c => [c.name, c.company ?? '', c.contact.email ?? '', c.contact.phone ?? ''].some(v => textIncludes(v, query)))
      : all
    const total = filtered.length
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)
    return simulate({ items, total, page, pageSize })
  },

  async listProjects(query: string, status: ProjectStatus | 'all', { page, pageSize }: Pagination): Promise<PagedResult<Project>> {
    const db = loadDb()
    let all = Object.values(db.projects)
    if (status !== 'all') all = all.filter(p => p.status === status)
    const filtered = query
      ? all.filter(p => [p.name, p.tags.join(' '), db.clients[p.clientId ?? '']?.name ?? ''].some(v => textIncludes(v, query)))
      : all
    const total = filtered.length
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)
    return simulate({ items, total, page, pageSize })
  },

  async getAllClients(): Promise<Client[]> {
    const db = loadDb()
    return simulate(Object.values(db.clients))
  },

  async createClient(input: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const db = loadDb()
    const id = createId()
    const now = nowIso()
    const client: Client = { ...input, id, createdAt: now, updatedAt: now }
    db.clients[id] = client
    saveDb(db)
    return simulate(client)
  },

  async updateClient(id: ID, patch: Partial<Client>): Promise<Client> {
    const db = loadDb()
    const existing = db.clients[id]
    const updated: Client = { ...existing, ...patch, id, updatedAt: nowIso() }
    db.clients[id] = updated
    saveDb(db)
    return simulate(updated)
  },

  async deleteClient(id: ID): Promise<void> {
    const db = loadDb()
    // unassign projects linked to this client
    Object.values(db.projects).forEach(p => {
      if (p.clientId === id) p.clientId = null
    })
    delete db.clients[id]
    saveDb(db)
    return simulate(undefined)
  },

  async createProject(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const db = loadDb()
    const id = createId()
    const now = nowIso()
    const project: Project = { ...input, id, createdAt: now, updatedAt: now }
    db.projects[id] = project
    saveDb(db)
    return simulate(project)
  },

  async updateProject(id: ID, patch: Partial<Project>): Promise<Project> {
    const db = loadDb()
    const existing = db.projects[id]
    const updated: Project = { ...existing, ...patch, id, updatedAt: nowIso() }
    db.projects[id] = updated
    saveDb(db)
    return simulate(updated)
  },

  async deleteProject(id: ID): Promise<void> {
    const db = loadDb()
    delete db.projects[id]
    saveDb(db)
    return simulate(undefined)
  },
}