import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../services/mockApi'
import { Client, ClientContact, ID, PagedResult, Project } from '../lib/types'
import SearchBar from '../components/ui/SearchBar'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import { Textarea, TextInput } from '../components/ui/Inputs'
import { Check, Edit2, Mail, Phone, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { formatDateTime } from '../lib/utils'

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
  contact: z.object({
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
  }),
  notes: z.string().optional(),
})

type FormState = z.infer<typeof clientSchema>

export default function ClientsPage() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [result, setResult] = useState<PagedResult<Client>>({ items: [], total: 0, page: 1, pageSize })

  const [projects, setProjects] = useState<Project[]>([])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<FormState>({ name: '', company: '', contact: {}, notes: '' })
  const initialFocus = useRef<HTMLInputElement>(null)

  const load = () => api.listClients(query, { page, pageSize }).then(setResult)

  useEffect(() => {
    load()
  }, [query, page])

  useEffect(() => {
    api.listProjects('', 'all', { page: 1, pageSize: 1000 }).then(r => setProjects(r.items))
  }, [])

  const clearForm = () => {
    setForm({ name: '', company: '', contact: {}, notes: '' })
    setErrors({})
  }

  const openCreate = () => {
    clearForm()
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({ name: c.name, company: c.company ?? '', contact: c.contact ?? {}, notes: c.notes ?? '' })
    setErrors({})
    setOpen(true)
  }

  const submit = async () => {
    const parsed = clientSchema.safeParse(form)
    if (!parsed.success) {
      const map: Record<string, string> = {}
      parsed.error.issues.forEach(i => map[i.path.join('.')] = i.message)
      setErrors(map)
      return
    }
    if (editing) {
      await api.updateClient(editing.id, parsed.data)
    } else {
      await api.createClient({ ...parsed.data, createdAt: '', updatedAt: '', id: '' } as any)
    }
    setOpen(false)
    clearForm()
    load()
  }

  const remove = async (c: Client) => {
    if (!confirm(`Delete client "${c.name}"? This will unassign their projects.`)) return
    await api.deleteClient(c.id)
    load()
  }

  const projectsByClient: Record<ID, Project[]> = useMemo(() => {
    const map: Record<ID, Project[]> = {}
    for (const p of projects) {
      const cid = p.clientId
      if (!cid) continue
      map[cid] = map[cid] || []
      map[cid].push(p)
    }
    return map
  }, [projects])

  const reassignProjects = async (clientId: ID, newProjectIds: ID[]) => {
    const current = projects.filter(p => p.clientId === clientId).map(p => p.id)
    const toUnassign = current.filter(id => !newProjectIds.includes(id))
    const toAssign = newProjectIds.filter(id => !current.includes(id))
    await Promise.all([
      ...toUnassign.map(id => api.updateProject(id, { clientId: null })),
      ...toAssign.map(id => api.updateProject(id, { clientId })),
    ])
    const updated = await api.listProjects('', 'all', { page: 1, pageSize: 1000 })
    setProjects(updated.items)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SearchBar onSearch={setQuery} placeholder="Search clients, email, phone…" />
        <button className="btn-primary" onClick={openCreate}>New Client</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800">
        <table className="min-w-full divide-y divide-neutral-200/70 text-sm dark:divide-neutral-800">
          <thead className="bg-neutral-50/70 dark:bg-neutral-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Company</th>
              <th className="px-4 py-3 text-left font-semibold">Contact</th>
              <th className="px-4 py-3 text-left font-semibold">Projects</th>
              <th className="px-4 py-3 text-left font-semibold">Updated</th>
              <th className="px-4 py-3 text-left font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
            {result.items.map(c => (
              <tr key={c.id} className="align-top hover:bg-neutral-50/70 dark:hover:bg-neutral-900/50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.company ?? '—'}</td>
                <td className="px-4 py-3 space-y-1 text-neutral-700 dark:text-neutral-300">
                  {c.contact.email && <div className="flex items-center gap-2"><Mail className="size-3" /> {c.contact.email}</div>}
                  {c.contact.phone && <div className="flex items-center gap-2"><Phone className="size-3" /> {c.contact.phone}</div>}
                  {c.contact.website && <div className="truncate text-brand-600 dark:text-brand-400"><a href={c.contact.website} target="_blank" rel="noreferrer">{c.contact.website}</a></div>}
                </td>
                <td className="px-4 py-3 w-[360px]">
                  <ProjectMultiSelect
                    allProjects={projects}
                    selectedIds={(projectsByClient[c.id] ?? []).map(p => p.id)}
                    onChange={(ids) => reassignProjects(c.id, ids)}
                  />
                </td>
                <td className="px-4 py-3">{formatDateTime(c.updatedAt)}</td>
                <td className="px-2 py-2 text-right">
                  <div className="inline-flex gap-1">
                    <button className="btn-ghost px-3 py-1" onClick={() => openEdit(c)} aria-label="Edit client"><Edit2 className="size-4" /></button>
                    <button className="btn-ghost px-3 py-1" onClick={() => remove(c)} aria-label="Delete client"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {result.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-600 dark:text-neutral-400">No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onPageChange={setPage} />

      <Modal open={open} title={editing ? 'Edit Client' : 'New Client'} onClose={() => setOpen(false)} initialFocusRef={initialFocus as any}>
        <div className="space-y-4">
          <TextInput id="name" label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} ref={initialFocus as any} />
          <TextInput id="company" label="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <TextInput id="email" label="Email" type="email" value={(form.contact as ClientContact).email ?? ''} onChange={e => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} error={errors['contact.email']} />
            <TextInput id="phone" label="Phone" value={(form.contact as ClientContact).phone ?? ''} onChange={e => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })} />
            <TextInput id="website" label="Website" value={(form.contact as ClientContact).website ?? ''} onChange={e => setForm({ ...form, contact: { ...form.contact, website: e.target.value } })} error={errors['contact.website']} />
          </div>
          <Textarea id="notes" label="Notes" placeholder="Optional notes, preferences, context" value={form.notes ?? ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex items-center justify-end gap-2 pt-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit}><Check className="size-4" /> Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ProjectMultiSelect({ allProjects, selectedIds, onChange }: { allProjects: Project[]; selectedIds: ID[]; onChange: (ids: ID[]) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return allProjects.filter(p => p.name.toLowerCase().includes(s))
  }, [allProjects, search])

  const toggle = (id: ID) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter(x => x !== id))
    else onChange([...selectedIds, id])
  }

  return (
    <div className="relative">
      <button className="input flex w-full items-center justify-between text-left" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(v => !v)}>
        <span className="truncate">
          {selectedIds.length === 0 ? 'Assign projects' : `${selectedIds.length} selected`}
        </span>
        <span>▾</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-neutral-200/70 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="p-2">
            <input className="input" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <ul role="listbox" className="max-h-64 overflow-auto py-1">
            {filtered.map(p => (
              <li key={p.id} role="option" aria-selected={selectedIds.includes(p.id)} className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800" onClick={() => toggle(p.id)}>
                <span className="truncate">{p.name}</span>
                {selectedIds.includes(p.id) && <span className="text-brand-600 dark:text-brand-400">✓</span>}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-neutral-500">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}