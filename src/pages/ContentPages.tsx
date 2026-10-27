import { CrudPage, TaskToggle, type FieldDef, type ColumnDef } from '../components/CrudPage'
import type { DatabaseRow } from '../lib/data'

export interface ContentPageProps {
  role: string
  live: boolean
  rows: DatabaseRow[]
  refresh: () => void
  /** buka form tambah otomatis (dipakai Quick Actions) */
  autoCreate?: boolean
}

/* ---------------- Jadwal ---------------- */
const SCHEDULE_FIELDS: FieldDef[] = [
  { key: 'course', label: 'Mata Kuliah', required: true, placeholder: 'Sistem Informasi' },
  { key: 'day', label: 'Hari', required: true, placeholder: 'Senin' },
  { key: 'start_time', label: 'Jam Mulai', placeholder: '10:00' },
  { key: 'end_time', label: 'Jam Selesai', placeholder: '11:40' },
  { key: 'room', label: 'Ruang', placeholder: 'A-204' },
  { key: 'lecturer', label: 'Dosen', placeholder: 'Nama dosen' },
]

const SCHEDULE_COLUMNS: ColumnDef[] = [
  { value: (r) => String(r.course ?? '—') },
  {
    value: () => '',
    sub: (r) => [r.day, r.start_time, r.room].filter(Boolean).join(' · '),
  },
]

export function SchedulePage({ role, live, rows, refresh, autoCreate }: ContentPageProps) {
  return (
    <CrudPage
      table="schedules"
      title="Jadwal Kuliah"
      emptyText="Belum ada jadwal."
      rows={rows}
      live={live}
      canEdit={role === 'admin'}
      fields={SCHEDULE_FIELDS}
      columns={SCHEDULE_COLUMNS}
      refresh={refresh}
      autoCreate={autoCreate}
    />
  )
}

/* ---------------- Tugas ---------------- */
const TASK_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Judul Tugas', required: true, placeholder: 'Tugas 6 — Basis Data' },
  { key: 'course', label: 'Mata Kuliah', placeholder: 'Basis Data' },
  { key: 'due_date', label: 'Deadline', type: 'date' },
  { key: 'file', label: 'Dokumen Tugas (PDF/DOC/gambar)', type: 'file', accept: '.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg' },
]

const TASK_COLUMNS: ColumnDef[] = [
  { value: (r) => String(r.title ?? '—') },
  {
    value: () => '',
    sub: (r) =>
      r.file_name
        ? `Terlampir: ${String(r.file_name)}`
        : r.course
          ? String(r.course)
          : undefined,
    badge: (r) =>
      r.done
        ? { text: 'Selesai', tone: 'green' }
        : { text: 'Belum selesai', tone: 'amber' },
  },
]

export function TasksPage({ role, live, rows, refresh, autoCreate }: ContentPageProps) {
  return (
    <CrudPage
      table="tasks"
      title="Tugas"
      emptyText="Tidak ada tugas."
      rows={rows}
      live={live}
      canEdit={role === 'admin'}
      fields={TASK_FIELDS}
      columns={TASK_COLUMNS}
      refresh={refresh}
      autoCreate={autoCreate}
      rowAction={(row, refresh) => <TaskToggle row={row} refresh={refresh} />}
    />
  )
}

/* ---------------- Materi (dengan upload dokumen) ---------------- */
const MATERIAL_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Judul Materi', required: true, placeholder: 'Modul Algoritma' },
  { key: 'file', label: 'Dokumen (PDF/DOC/PPT/gambar)', type: 'file', accept: '.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg' },
]

const MATERIAL_COLUMNS: ColumnDef[] = [
  { value: (r) => String(r.title ?? '—') },
  {
    value: () => '',
    sub: (r) => {
      const desc = r.description ? String(r.description) : ''
      const shortDesc = desc.length > 140 ? desc.slice(0, 140) + '…' : desc
      if (r.course && desc) return `${String(r.course)} — ${shortDesc}`
      if (r.course) return String(r.course)
      if (r.file_name) return `Terlampir: ${String(r.file_name)}`
      if (r.file_url) return 'Ada dokumen'
      if (r.size) return String(r.size)
      return shortDesc || undefined
    },
  },
]

export function MaterialsPage({ role, live, rows, refresh, autoCreate }: ContentPageProps) {
  return (
    <CrudPage
      table="materials"
      title="Materi Pembelajaran"
      emptyText="Belum ada materi."
      rows={rows}
      live={live}
      canEdit={role === 'admin'}
      fields={MATERIAL_FIELDS}
      columns={MATERIAL_COLUMNS}
      refresh={refresh}
      autoCreate={autoCreate}
    />
  )
}

/* ---------------- Pengumuman ---------------- */
const ANNOUNCEMENT_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Judul', required: true, placeholder: 'Pengumuman penting' },
  { key: 'body', label: 'Isi', type: 'textarea', placeholder: 'Detail pengumuman…' },
]

const ANNOUNCEMENT_COLUMNS: ColumnDef[] = [
  { value: (r) => String(r.title ?? '—') },
  {
    value: () => '',
    sub: (r) => (r.body ? String(r.body) : undefined),
    badge: (r) => (r.pinned ? { text: 'Disematkan', tone: 'rose' } : undefined),
  },
]

export function AnnouncementsPage({ role, live, rows, refresh, autoCreate }: ContentPageProps) {
  return (
    <CrudPage
      table="announcements"
      title="Pengumuman"
      emptyText="Belum ada pengumuman."
      rows={rows}
      live={live}
      canEdit={role === 'admin'}
      fields={ANNOUNCEMENT_FIELDS}
      columns={ANNOUNCEMENT_COLUMNS}
      refresh={refresh}
      autoCreate={autoCreate}
    />
  )
}