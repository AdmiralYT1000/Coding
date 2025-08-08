import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../services/mockApi'
import { Client, PagedResult, Project, ProjectStatus } from '../lib/types'
import SearchBar from '../components/ui/SearchBar'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import { Select, Textarea, TextInput } from '../components/ui/Inputs'
import { Check, Edit2, Folder, MoreVertical, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { formatDateTime } from '../lib/utils'

const projectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  clientId: z.string().nullable(),
  status: z.enum(['active', 'archived'] satisfies [ProjectStatus, ProjectStatus]),
  ratePerHour: z.coerce.number().min(0).optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

type FormState = z.infer<typeof projectSchema>

export default function ProjectsPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [result, setResult] = useState<PagedResult<Project>>({ items: [], total: 0, page: 1, pageSize })
  const [clients, setClients] = useState<Client[]>([])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<FormState>({ name: '', clientId: null, status: 'active', ratePerHour: undefined, tags: [], notes: '' })
  const initialFocus = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.getAllClients().then(setClients)
  }, [])

  useEffect(() => {
    api.listProjects(query, status, { page, pageSize }).then(setResult)
  }, [query, status, page])

  const clearForm = () => {
    setForm({ name: '', clientId: null, status: 'active', ratePerHour: undefined, tags: [], notes: '' })
    setErrors({})
  }

  const openCreate = () => {
    clearForm()
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (p: Project) => {
    setEditing(p)
    setForm({ name: p.name, clientId: p.clientId, status: p.status, ratePerHour: p.ratePerHour, tags: p.tags, notes: p.notes })
    setErrors({})
    setOpen(true)
  }

  const submit = async () => {
    const parsed = projectSchema.safeParse(form)
    if (!parsed.success) {
      const map: Record<string, string> = {}
      parsed.error.issues.forEach(i => map[i.path.join('.')] = i.message)
      setErrors(map)
      return
    }
    if (editing) {
      await api.updateProject(editing.id, parsed.data)
    } else {
      await api.createProject({ ...parsed.data, createdAt: '', updatedAt: '', id: '' } as any)
    }
    setOpen(false)
    clearForm()
    api.listProjects(query, status, { page, pageSize }).then(setResult)
  }

  const remove = async (p: Project) => {
    if (!confirm(`Delete project "${p.name}"?`)) return
    await api.deleteProject(p.id)
    api.listProjects(query, status, { page, pageSize }).then(setResult)
  }

  const clientsById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SearchBar onSearch={setQuery} placeholder="Search projects, tags, client…" />
          <select className="input w-40" value={status} onChange={e => { setPage(1); setStatus(e.target.value as any) }} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button className="btn-primary" onClick={openCreate}><Folder className="size-4" /> New Project</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800">
        <table className="min-w-full divide-y divide-neutral-200/70 text-sm dark:divide-neutral-800">
          <thead className="bg-neutral-50/70 dark:bg-neutral-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Client</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Rate</th>
              <th className="px-4 py-3 text-left font-semibold">Updated</th>
              <th className="px-4 py-3 text-left font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
            {result.items.map(p => (
              <tr key={p.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/50">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.clientId ? clientsById[p.clientId]?.name ?? '—' : '—'}</td>
                <td className="px-4 py-3">
                  <span className={p.status === 'active' ? 'chip bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'chip bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'}>{p.status}</span>
                </td>
                <td className="px-4 py-3">{p.ratePerHour ? `$${p.ratePerHour}/h` : '—'}</td>
                <td className="px-4 py-3">{formatDateTime(p.updatedAt)}</td>
                <td className="px-2 py-2 text-right">
                  <div className="inline-flex gap-1">
                    <button className="btn-ghost px-3 py-1" onClick={() => openEdit(p)} aria-label="Edit project"><Edit2 className="size-4" /></button>
                    <button className="btn-ghost px-3 py-1" onClick={() => remove(p)} aria-label="Delete project"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {result.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-600 dark:text-neutral-400">No projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onPageChange={setPage} />

      <Modal open={open} title={editing ? 'Edit Project' : 'New Project'} onClose={() => setOpen(false)} initialFocusRef={initialFocus as any}>
        <div className="space-y-4">
          <TextInput id="name" label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} ref={initialFocus as any} />
          <Select id="clientId" label="Client" value={form.clientId ?? ''} onChange={e => setForm({ ...form, clientId: e.target.value || null })}>
            <option value="">No client</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select id="status" label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </Select>
            <TextInput id="rate" label="Rate per hour" placeholder="e.g. 100" inputMode="decimal" value={form.ratePerHour?.toString() ?? ''} onChange={e => setForm({ ...form, ratePerHour: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
          <Textarea id="notes" label="Notes" placeholder="Optional" value={form.notes ?? ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex items-center justify-end gap-2 pt-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit}><Check className="size-4" /> Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}