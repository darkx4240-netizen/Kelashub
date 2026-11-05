import { useMemo, useState } from 'react'
import { Users, Search, Plus, Pencil, Trash2, Ban } from 'lucide-react'
import { Panel, Section } from '../components/Section'
import { ROSTER } from '../lib/roster'
import type { DatabaseRow } from '../lib/data'
import { insertRow, updateRow, deleteRow } from '../lib/mutations'
import { getBlockedMap, setBlocked, setManyBlocked, type AccessMap } from '../lib/access'

interface MembersPageProps {
  role: string
  live: boolean
  members: DatabaseRow[]
  refresh: () => void
}

export function MembersPage({ role, live, members, refresh }: MembersPageProps) {
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DatabaseRow | null>(null)
  const [name, setName] = useState('')
  const [nim, setNim] = useState('')
  const [error, setError] = useState('')
  const [blocked, setBlockedMap] = useState<AccessMap>(() => getBlockedMap())

  const canEdit = role === 'admin'

  // Sumber data: tabel members bila ada data (Supabase/local), fallback roster.
  const list = useMemo(() => {
    if (Array.isArray(members) && members.length > 0) {
      return members
        .map((r, i) => ({
          id: String(r.id ?? i),
          name: String(r.name ?? r.full_name ?? '—'),
          nim: r.nim ? String(r.nim) : '',
        }))
        .filter((s) => s.nim)
    }
    return ROSTER.map((s, i) => ({ id: String(i), name: s.name, nim: s.nim }))
  }, [members])

  const filtered = useMemo(() => {
    if (!q.trim()) return list
    const t = q.trim().toLowerCase()
    return list.filter((s) => s.name.toLowerCase().includes(t) || s.nim.toLowerCase().includes(t))
  }, [list, q])

  const blockedCount = useMemo(
    () => list.filter((s) => blocked[s.nim]).length,
    [list, blocked],
  )
  const allBlocked = list.length > 0 && blockedCount === list.length

  function toggle(s: { id: string; name: string; nim: string }) {
    const next = !blocked[s.nim]
    setBlocked(s.nim, next)
    setBlockedMap((m) => {
      const c = { ...m }
      if (next) c[s.nim] = true
      else delete c[s.nim]
      return c
    })
  }

  function toggleAll() {
    if (!canEdit) return
    const next = !allBlocked
    setManyBlocked(filtered.map((s) => s.nim), next)
    setBlockedMap((m) => {
      const c = { ...m }
      for (const s of filtered) {
        if (next) c[s.nim] = true
        else delete c[s.nim]
      }
      return c
    })
  }

  function openCreate() {
    setEditing(null)
    setName('')
    setNim('')
    setError('')
    setShowForm(true)
  }

  function openEdit(row: { id: string; name: string; nim: string }) {
    setEditing(row as unknown as DatabaseRow)
    setName(row.name)
    setNim(row.nim)
    setError('')
    setShowForm(true)
  }

  async function submit() {
    setError('')
    const n = name.trim()
    const m = nim.trim()
    if (!n || !m) {
      setError('Nama dan NIM wajib diisi.')
      return
    }
    if (editing) {
      const res = await updateRow('members', String(editing.id), { name: n, nim: m })
      if (!res.ok) setError(res.error ?? 'Gagal menyimpan.')
    } else {
      const res = await insertRow('members', { name: n, nim: m, status: 'aktif' })
      if (!res.ok) setError(res.error ?? 'Gagal menambah.')
    }
    setShowForm(false)
    refresh()
  }

  async function remove(id: string) {
    if (!window.confirm('Hapus anggota ini?')) return
    const res = await deleteRow('members', id)
    if (!res.ok) setError(res.error ?? 'Gagal menghapus.')
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">Anggota Kelas</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {list.length} mahasiswa terdaftar
            {!live && <span className="text-mute"> · data kehadiran 20 Okt 2026</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-mute" />
          {canEdit && (
            <>
              <button
                type="button"
                onClick={toggleAll}
                className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition hover:-translate-y-0.5 ${
                  allBlocked
                    ? 'border-emerald-500/[0.3] bg-emerald-500/[0.12] text-emerald-400'
                    : 'border-white/[0.12] bg-white/[0.04] text-ink-soft'
                }`}
              >
                <Ban className="h-4 w-4" />
                {allBlocked ? 'Buka Semua' : 'Blokir Semua'}
              </button>
              <button
                onClick={openCreate}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                Tambah
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-500/[0.12] px-3 py-2 text-xs font-medium text-rose-400">{error}</p>
      )}

      <Section title="Daftar Mahasiswa">
        <Panel className="p-0">
          <div className="border-b border-white/[0.06] p-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama atau NIM…"
                className="h-10 w-full rounded-xl border border-white/[0.12] bg-surface pl-9 pr-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            <ul className="divide-y divide-white/[0.06]">
              {filtered.map((s, i) => {
                const isOn = !blocked[s.nim]
                return (
                  <li
                    key={s.id}
                    className="anim-enter flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.05]"
                    style={{ animationDelay: `${Math.min(i, 24) * 20}ms` }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                      {s.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                      <p className="truncate font-mono text-xs text-mute">{s.nim}</p>
                    </div>
                    {canEdit ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <ToggleRow
                          on={isOn}
                          onClick={() => toggle(s)}
                          label={isOn ? 'Login aktif' : 'Login diblokir'}
                        />
                        <button
                          onClick={() => openEdit(s)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-mute transition hover:bg-white/[0.06] hover:text-ink"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(s.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-mute transition hover:bg-rose-500/[0.12] hover:text-rose-400"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          isOn ? 'bg-emerald-500/[0.12] text-emerald-400' : 'bg-rose-500/[0.12] text-rose-400'
                        }`}
                      >
                        {isOn ? 'Aktif' : 'Diblokir'}
                      </span>
                    )}
                  </li>
                )
              })}
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-mute">
                  Tidak ada hasil untuk “{q}”.
                </li>
              )}
            </ul>
          </div>
        </Panel>
      </Section>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setShowForm(false)} />
          <div className="anim-enter relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-surface p-6 shadow-card-hover">
            <h3 className="mb-4 text-lg font-semibold text-ink">
              {editing ? 'Edit Anggota' : 'Tambah Anggota'}
            </h3>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-soft">Nama</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="h-11 w-full rounded-xl border border-white/[0.12] bg-surface px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-soft">NIM</span>
                <input
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="1926xxxx"
                  inputMode="numeric"
                  className="h-11 w-full rounded-xl border border-white/[0.12] bg-surface px-3 font-mono text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium text-ink-soft transition hover:bg-white/[0.06]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ToggleRow({
  on,
  onClick,
  label,
}: {
  on: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      title={label}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        on ? 'bg-primary' : 'bg-white/[0.12]'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          on ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}