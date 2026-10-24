import { useMemo, type ReactNode } from 'react'
import {
  ClipboardList,
  CalendarDays,
  BookOpen,
  Megaphone,
  Plus,
  UserPlus,
  Upload,
  FileText,
} from 'lucide-react'
import { Hero } from '../components/Hero'
import { StatsGrid } from '../components/StatsGrid'
import { Section, Panel } from '../components/Section'
import { TiltCard } from '../components/TiltCard'
import type { DatabaseRow } from '../lib/data'

interface AdminPageProps {
  name: string
  live: boolean
  tables: Record<string, DatabaseRow[]>
  /** berpindah halaman + opsional buka form tambah */
  onAction: (page: string) => void
}

interface QuickAction {
  id: string
  label: string
  desc: string
  icon: ReactNode
  /** halaman tujuan setelah diklik */
  target: string
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'add-member', label: 'Tambah Anggota', desc: 'Undang mahasiswa ke kelas', icon: <UserPlus className="h-5 w-5" />, target: 'members' },
  { id: 'add-task', label: 'Buat Tugas', desc: 'Posting tugas baru', icon: <ClipboardList className="h-5 w-5" />, target: 'tasks' },
  { id: 'add-material', label: 'Unggah Materi', desc: 'Tambah modul atau dokumen', icon: <Upload className="h-5 w-5" />, target: 'materials' },
  { id: 'add-announcement', label: 'Tulis Pengumuman', desc: 'Beri info ke kelas', icon: <Megaphone className="h-5 w-5" />, target: 'announcements' },
  { id: 'add-schedule', label: 'Atur Jadwal', desc: 'Tambah sesi kuliah', icon: <CalendarDays className="h-5 w-5" />, target: 'schedule' },
  { id: 'manage-material', label: 'Kelola Materi', desc: 'Susun bahan ajar', icon: <BookOpen className="h-5 w-5" />, target: 'materials' },
]

export function AdminPage({ name, live, tables, onAction }: AdminPageProps) {
  const stats = useMemo(() => ({
    totalTasks: Array.isArray(tables.tasks) ? tables.tasks.length : 0,
    pendingTasks: 0,
    upcomingDeadline: null as string | null,
    materials: Array.isArray(tables.materials) ? tables.materials.length : 0,
    announcements: Array.isArray(tables.announcements) ? tables.announcements.length : 0,
    members: Array.isArray(tables.members) ? tables.members.length : 0,
  }), [tables])

  const members = useMemo(() => {
    const rows = tables.members
    if (!Array.isArray(rows)) return []
    return rows.slice(0, 6).map((r, i) => ({
      id: String(r.id ?? i),
      name: String(r.name ?? r.full_name ?? '—'),
      email: r.email ? String(r.email) : `NIM ${r.nim ?? '—'}`,
      status: r.status ? String(r.status) : 'aktif',
    }))
  }, [tables.members])

  return (
    <div className="space-y-6">
      <Hero name={name} live={live} pendingTasks={null} todayClasses={null} nextClass={null} />

      <StatsGrid stats={stats} live={live} admin />

      {/* Quick Actions — sekarang klikable */}
      <Section title="Quick Actions" action={<Plus className="h-4 w-4 text-mute" />}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => onAction(a.target)}
              className="anim-enter flex flex-col items-start gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                {a.icon}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{a.label}</span>
                <span className="mt-0.5 block text-xs text-mute">{a.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Anggota Kelas" className="lg:col-span-1">
          <Panel className="p-0">
            <div className="divide-y divide-black/[0.04] p-2">
              {members.length === 0 ? (
                <p className="p-4 text-sm text-mute">
                  {live ? 'Belum ada anggota.' : 'Data anggota belum dimuat.'}
                </p>
              ) : (
                members.map((m, i) => (
                  <div
                    key={m.id}
                    className="anim-enter flex items-center gap-3 rounded-xl p-3 transition hover:bg-black/[0.02]"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                      {m.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{m.name}</p>
                      <p className="truncate text-xs text-mute">{m.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </Section>

        <Section title="Ringkasan Pengelolaan" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <TiltCard variant="lift" className="p-5">
              <p className="text-sm font-semibold text-ink">Tugas Aktif</p>
              <p className="mt-2 text-3xl font-bold text-ink">
                {stats.totalTasks.toLocaleString('id-ID')}
              </p>
              <p className="mt-1 text-xs text-mute">Tugas yang sedang berjalan</p>
            </TiltCard>
            <TiltCard variant="lift" className="p-5">
              <p className="text-sm font-semibold text-ink">Distribusi Materi</p>
              <p className="mt-2 text-3xl font-bold text-ink">
                {stats.materials.toLocaleString('id-ID')}
              </p>
              <p className="mt-1 text-xs text-mute">Modul & dokumen tersedia</p>
            </TiltCard>
          </div>

          <div className="mt-4 space-y-2">
            <ManageRow icon={<FileText className="h-4 w-4" />} label="Kelola tugas" target="tasks" onAction={onAction} />
            <ManageRow icon={<BookOpen className="h-4 w-4" />} label="Kelola materi" target="materials" onAction={onAction} />
            <ManageRow icon={<CalendarDays className="h-4 w-4" />} label="Kelola jadwal" target="schedule" onAction={onAction} />
            <ManageRow icon={<Megaphone className="h-4 w-4" />} label="Kelola pengumuman" target="announcements" onAction={onAction} />
          </div>
        </Section>
      </div>
    </div>
  )
}

function ManageRow({
  icon,
  label,
  target,
  onAction,
}: {
  icon: ReactNode
  label: string
  target: string
  onAction: (page: string) => void
}) {
  return (
    <button
      onClick={() => onAction(target)}
      className="flex w-full items-center gap-3 rounded-xl border border-black/[0.05] bg-white px-4 py-3 text-left transition hover:bg-black/[0.02]"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.03] text-ink-soft">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-ink">{label}</span>
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">
        Buka
      </span>
    </button>
  )
}