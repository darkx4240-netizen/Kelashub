import { ROSTER } from './roster'

export type TableName =
  | 'schedules'
  | 'tasks'
  | 'materials'
  | 'announcements'
  | 'members'
  | 'activity'

export type Row = Record<string, unknown>

const STORE_KEY = 'kelashub_db_v1'

let cache: Record<TableName, Row[]> | null = null
const listeners = new Set<() => void>()

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

function iso(d: string): string {
  return new Date(d).toISOString()
}

function seed(): Record<TableName, Row[]> {
  const members: Row[] = ROSTER.map((s, i) => ({
    id: `mbr_${i + 1}`,
    nim: s.nim,
    name: s.name,
    email: '',
    status: 'aktif',
    created_at: iso('2026-10-20T08:00:00'),
  }))

  const schedules: Row[] = [
    { id: 'sch_1', course: 'Sistem Informasi', day: 'Senin', start_time: '10:00', end_time: '11:40', room: 'A-204', lecturer: 'Dosen SI', created_at: iso('2026-10-19') },
    { id: 'sch_2', course: 'Basis Data', day: 'Selasa', start_time: '08:00', end_time: '09:40', room: 'Lab Komputer 2', lecturer: 'Dosen BD', created_at: iso('2026-10-19') },
    { id: 'sch_3', course: 'Algoritma & Pemrograman', day: 'Rabu', start_time: '13:00', end_time: '14:40', room: 'A-101', lecturer: 'Dosen Algo', created_at: iso('2026-10-19') },
    { id: 'sch_4', course: 'Kewarganegaraan', day: 'Kamis', start_time: '09:00', end_time: '10:40', room: 'B-302', lecturer: 'Dosen KN', created_at: iso('2026-10-19') },
    { id: 'sch_5', course: 'Bahasa Inggris', day: 'Jumat', start_time: '08:00', end_time: '09:40', room: 'A-201', lecturer: 'Dosen BI', created_at: iso('2026-10-19') },
  ]

  const tasks: Row[] = [
    { id: 'tsk_1', title: 'Tugas 5 — Pancasila', course: 'Pendidikan Pancasila', due_date: daysFromNow(3), done: false, created_at: iso('2026-10-20') },
    { id: 'tsk_2', title: 'Laporan Praktikum Basis Data', course: 'Basis Data', due_date: daysFromNow(2), done: false, created_at: iso('2026-10-21') },
    { id: 'tsk_3', title: 'Presentasi Sistem Informasi', course: 'Sistem Informasi', due_date: daysFromNow(6), done: false, created_at: iso('2026-10-21') },
    { id: 'tsk_4', title: 'Rangkuman Algoritma', course: 'Algoritma & Pemrograman', due_date: daysFromNow(-1), done: true, created_at: iso('2026-10-18') },
  ]

  const materials: Row[] = [
    { id: 'mat_1', title: 'Modul Algoritma & Struktur Data', size: 'PDF', url: '#', created_at: iso('2026-10-15') },
    { id: 'mat_2', title: 'Slide Konsep Basis Data', size: 'PPT', url: '#', created_at: iso('2026-10-16') },
    { id: 'mat_3', title: 'Latihan Soal Pemrograman', size: 'PDF', url: '#', created_at: iso('2026-10-17') },
    { id: 'mat_4', title: 'Materi Present Tense', size: 'PPT', url: '#', created_at: iso('2026-10-18') },
  ]

  const announcements: Row[] = [
    { id: 'ann_1', title: 'Perubahan jadwal kuliah minggu depan', body: 'Kuliah Basis Data Selasa dipindah ke Lab Komputer 1. Perhatikan jadwal terbaru di halaman Jadwal.', pinned: true, created_at: iso('2026-10-22') },
    { id: 'ann_2', title: 'Kumpul Tugas 5 paling lambat Jumat', body: 'Tugas 5 Pancasila dikumpulkan dalam format PDF melalui halaman Tugas.', pinned: false, created_at: iso('2026-10-21') },
    { id: 'ann_3', title: 'Kuliah tambahan hari Sabtu', body: 'Akan ada sesi konsultasi tambahan pukul 10.00 di Ruang A-101.', pinned: false, created_at: iso('2026-10-20') },
  ]

  const activity: Row[] = [
    { id: 'act_1', text: 'Revan Krestian mengumpulkan Rangkuman Algoritma.', created_at: iso('2026-10-22') },
    { id: 'act_2', text: 'Admin memposting pengumuman baru.', created_at: iso('2026-10-21') },
    { id: 'act_3', text: 'Materi Latihan Soal Pemrograman ditambahkan.', created_at: iso('2026-10-20') },
    { id: 'act_4', text: 'Jadwal kuliah diperbarui.', created_at: iso('2026-10-19') },
  ]

  return { schedules, tasks, materials, announcements, members, activity }
}

function load(): Record<TableName, Row[]> {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { data?: Record<TableName, Row[]> }
      if (parsed.data) {
        cache = parsed.data
        return cache
      }
    }
  } catch {
    /* corrupted → reseed */
  }
  cache = seed()
  persist()
  return cache
}

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ data: cache }))
  } catch {
    /* quota / private mode */
  }
}

function emit() {
  listeners.forEach((l) => l())
}

export const store = {
  get data() {
    return load()
  },
  list(table: TableName): Row[] {
    return load()[table]
  },
  insert(table: TableName, row: Partial<Row>): Row {
    const full: Row = {
      id: uid(table.slice(0, 3)),
      created_at: new Date().toISOString(),
      ...row,
    }
    load()[table] = [full, ...load()[table]]
    persist()
    emit()
    return full
  },
  update(table: TableName, id: string, patch: Partial<Row>): void {
    load()[table] = load()[table].map((r) => (r.id === id ? { ...r, ...patch } : r))
    persist()
    emit()
  },
  remove(table: TableName, id: string): void {
    load()[table] = load()[table].filter((r) => r.id !== id)
    persist()
    emit()
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  reset(): void {
    cache = seed()
    persist()
    emit()
  },
}