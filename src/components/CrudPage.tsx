import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Paperclip, Download, Eye } from 'lucide-react'
import { Panel, Section } from '../components/Section'
import type { DatabaseRow } from '../lib/data'
import { insertRow, updateRow, deleteRow, uploadMaterialFile, deleteMaterialFile } from '../lib/mutations'

export interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'date' | 'time' | 'number' | 'file'
  placeholder?: string
  required?: boolean
  accept?: string
}

export interface ColumnDef {
  /** value lookup dari row */
  value: (row: DatabaseRow) => string
  /** label kecil sub-line opsional */
  sub?: (row: DatabaseRow) => string | undefined
  /** badge opsional */
  badge?: (row: DatabaseRow) => { text: string; tone: 'green' | 'amber' | 'rose' | 'gray' } | undefined
}

interface CrudPageProps {
  table: 'schedules' | 'tasks' | 'materials' | 'announcements' | 'members'
  title: string
  emptyText: string
  rows: DatabaseRow[]
  live: boolean
  canEdit: boolean
  fields: FieldDef[]
  columns: ColumnDef[]
  refresh: () => void
  /** buka form tambah otomatis saat halaman dimuat (dipakai Quick Actions) */
  autoCreate?: boolean
  /** aksi khusus per baris (misal toggle selesai untuk tugas) */
  rowAction?: (row: DatabaseRow, refresh: () => void) => ReactNode
}

const BADGE_TONE: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  gray: 'bg-black/[0.04] text-ink-soft',
}

export function CrudPage({
  table,
  title,
  emptyText,
  rows,
  live,
  canEdit,
  fields,
  columns,
  refresh,
  autoCreate,
  rowAction,
}: CrudPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DatabaseRow | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [fileData, setFileData] = useState<Record<string, { name: string; file: File }>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<{ url: string; name: string; kind: 'pdf' | 'image' | 'office' } | null>(null)
  const list = rows

  function resetForm() {
    setForm({})
    setFileData({})
    setError('')
  }

  function openCreate() {
    setEditing(null)
    resetForm()
    setShowForm(true)
  }

  function openEdit(row: DatabaseRow) {
    setEditing(row)
    const init: Record<string, string> = {}
    for (const f of fields) {
      if (f.type !== 'file') init[f.key] = row[f.key] != null ? String(row[f.key]) : ''
    }
    setForm(init)
    setFileData({})
    setError('')
    setShowForm(true)
  }

  // auto-open untuk Quick Actions
  useEffect(() => {
    if (autoCreate && canEdit) openCreate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCreate, canEdit])

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onFile(key: string, file: File | undefined) {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10 MB.')
      return
    }
    setFileData((fd) => ({ ...fd, [key]: { name: file.name, file } }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload: Record<string, unknown> = {}
      for (const f of fields) {
        if (f.type === 'file') {
          const fd = fileData[f.key]
          if (fd) {
            // upload ke Storage Supabase → simpan URL publik
            // folder upload mengikuti nama tabel (materials/tasks/dll.)
            const up = await uploadMaterialFile(fd.file, 'admin', table)
            if (!up.ok) {
              setError(up.error ?? 'Gagal mengunggah file.')
              setBusy(false)
              return
            }
            payload[`${f.key}_name`] = fd.name
            payload[`${f.key}_url`] = up.url
            payload[`${f.key}_path`] = up.path
          }
          continue
        }
        const v = (form[f.key] ?? '').trim()
        if (f.required && !v) {
          setError(`${f.label} wajib diisi.`)
          setBusy(false)
          return
        }
        // field kosong (terutama date) jadi null, bukan string kosong,
        // supaya tidak ditolak Postgres.
        payload[f.key] = v === '' ? null : v
      }
      if (editing) {
        // kalau ganti file, hapus file lama dari storage
        const oldPath = editing.file_path ? String(editing.file_path) : undefined
        const newPath = payload.file_path ? String(payload.file_path) : undefined
        if (oldPath && newPath && oldPath !== newPath) {
          await deleteMaterialFile(oldPath)
        }
        const res = await updateRow(table, String(editing.id), payload)
        if (!res.ok) setError(res.error ?? 'Gagal menyimpan.')
      } else {
        const res = await insertRow(table, payload)
        if (!res.ok) setError(res.error ?? 'Gagal menambah.')
      }
      setShowForm(false)
      refresh()
    } finally {
      setBusy(false)
    }
  }

  async function remove(row: DatabaseRow) {
    if (!window.confirm('Hapus item ini?')) return
    const res = await deleteRow(table, String(row.id))
    if (!res.ok) setError(res.error ?? 'Gagal menghapus.')
    refresh()
  }

  function openPreview(row: DatabaseRow) {
    const url = String(row.file_url)
    const name = row.file_name ? String(row.file_name) : 'Dokumen'
    const ext = name.split('.').pop()?.toLowerCase() ?? ''
    const isImage = /png|jpe?g|gif|webp|bmp|svg/.test(ext)
    const isOffice = /docx?|xlsx?|pptx?|odt|ods|odp|rtf|txt/.test(ext)
    if (isImage) {
      setPreview({ url, name, kind: 'image' })
    } else if (isOffice) {
      // Office/dokumen teks → viewer online (tidak bisa render di browser langsung)
      setPreview({ url, name, kind: 'office' })
    } else {
      // PDF & yang tidak dikenal → preview inline
      setPreview({ url, name, kind: 'pdf' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {list.length} item · {live ? 'data sinkron' : 'tersimpan lokal'}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>
      )}

      <Section title={title}>
        <Panel className="p-0">
          {list.length === 0 ? (
            <p className="p-6 text-center text-sm text-mute">{emptyText}</p>
          ) : (
            <ul className="divide-y divide-black/[0.04]">
              {list.map((row, i) => (
                <li
                  key={String(row.id)}
                  className="anim-enter flex items-center gap-4 px-4 py-3.5 transition hover:bg-black/[0.02]"
                  style={{ animationDelay: `${Math.min(i, 20) * 20}ms` }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {columns[0]?.value(row) ?? '—'}
                    </p>
                    {columns.slice(1).map((c, j) => {
                      const sub = c.sub?.(row)
                      const badge = c.badge?.(row)
                      return (
                        <div key={j} className="mt-0.5 flex flex-wrap items-center gap-2">
                          {sub && <span className="text-xs text-ink-soft">{sub}</span>}
                          {badge && (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${BADGE_TONE[badge.tone]}`}
                            >
                              {badge.text}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {rowAction?.(row, refresh)}
                    {typeof row.file_url === 'string' && row.file_url && (
                      <>
                        <button
                          onClick={() => openPreview(row)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black/[0.03] px-2.5 text-xs font-semibold text-ink-soft transition hover:bg-black/[0.07]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Lihat
                        </button>
                        <button
                          onClick={() => downloadFile(String(row.file_url), row.file_name ? String(row.file_name) : undefined)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 text-xs font-semibold text-primary transition hover:bg-indigo-100"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Unduh
                        </button>
                      </>
                    )}
                    {canEdit && (
                      <>
                        <button
                          onClick={() => openEdit(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-mute transition hover:bg-black/[0.05] hover:text-ink"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-mute transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </Section>

      {preview && (
        <PreviewModal preview={preview} onClose={() => setPreview(null)} />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Item' : 'Tambah Item'} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            {fields.map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-soft">{f.label}</span>
                {f.type === 'textarea' ? (
                  <textarea
                    value={form[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                ) : f.type === 'file' ? (
                  <FileInput
                    name={fileData[f.key]?.name}
                    accept={f.accept ?? '*/*'}
                    onPick={(file) => onFile(f.key, file)}
                  />
                ) : (
                  <input
                    type={f.type ?? 'text'}
                    value={form[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                )}
              </label>
            ))}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium text-ink-soft transition hover:bg-black/[0.05]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

/**
 * Download file dari URL publik langsung (fetch → blob → trigger save),
 * bukan buka di tab baru, jadi PDF/office ke-download beneran.
 */
async function downloadFile(url: string, fileName?: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('unduh gagal')
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = fileName ?? 'file'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  } catch {
    // fallback: buka di tab baru
    window.open(url, '_blank', 'noopener')
  }
}

function FileInput({
  name,
  accept,
  onPick,
}: {
  name: string | undefined
  accept: string
  onPick: (f: File | undefined) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className="flex h-11 w-full items-center gap-2 rounded-xl border border-dashed border-black/[0.15] bg-black/[0.02] px-3 text-sm text-ink-soft transition hover:border-primary hover:bg-primary-soft/40"
    >
      <Paperclip className="h-4 w-4 text-mute" />
      <span className="truncate">{name ? name : 'Pilih file untuk diunggah…'}</span>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
    </button>
  )
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="anim-enter relative w-full max-w-md rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card-hover">
        <h3 className="mb-4 text-lg font-semibold text-ink">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function PreviewModal({
  preview,
  onClose,
}: {
  preview: { url: string; name: string; kind: 'pdf' | 'image' | 'office' }
  onClose: () => void
}) {
  const officeViewer =
    preview.kind === 'office'
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(preview.url)}`
      : preview.url
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" onClick={onClose} />
      <div className="anim-enter relative flex h-full max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card-hover">
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-3.5">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{preview.name}</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-mute transition hover:bg-black/[0.05] hover:text-ink"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 bg-black/[0.02]">
          {preview.kind === 'image' ? (
            <img
              src={preview.url}
              alt={preview.name}
              className="mx-auto max-h-full w-auto object-contain"
            />
          ) : (
            <iframe
              src={officeViewer}
              title={preview.name}
              className="h-full w-full"
            />
          )}
        </div>
      </div>
    </div>
  )
}

/** Toggle "selesai" untuk tugas (bisa oleh mahasiswa). */
export function TaskToggle({ row, refresh }: { row: DatabaseRow; refresh: () => void }) {
  const done = Boolean(row.done)
  return (
    <button
      onClick={async () => {
        await updateRow('tasks', String(row.id), { done: !done })
        refresh()
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-mute transition hover:text-emerald-600"
      aria-label={done ? 'Tandai belum selesai' : 'Tandai selesai'}
    >
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      ) : (
        <Circle className="h-5 w-5" />
      )}
    </button>
  )
}