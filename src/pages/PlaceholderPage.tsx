import { Users, ClipboardList, CalendarDays, BookOpen, Megaphone, Settings, LayoutDashboard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Panel } from '../components/Section'

const META: Record<string, { title: string; desc: string; icon: LucideIcon }> = {
  schedule: { title: 'Jadwal Kuliah', desc: 'Data jadwal diambil dari Supabase saat terhubung.', icon: CalendarDays },
  tasks: { title: 'Tugas', desc: 'Data tugas diambil dari Supabase saat terhubung.', icon: ClipboardList },
  materials: { title: 'Materi', desc: 'Data materi diambil dari Supabase saat terhubung.', icon: BookOpen },
  announcements: { title: 'Pengumuman', desc: 'Data pengumuman diambil dari Supabase saat terhubung.', icon: Megaphone },
  members: { title: 'Anggota Kelas', desc: 'Data anggota diambil dari Supabase saat terhubung.', icon: Users },
  settings: { title: 'Pengaturan', desc: 'Data pengaturan diambil dari Supabase saat terhubung.', icon: Settings },
}

export function PlaceholderPage({ id }: { id: string }) {
  const meta = META[id] ?? { title: 'Dashboard', desc: '', icon: LayoutDashboard }
  const Icon = meta.icon
  return (
    <Panel className="anim-enter flex flex-col items-center justify-center gap-3 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Icon className="h-7 w-7" />
      </span>
      <h2 className="text-xl font-bold text-ink">{meta.title}</h2>
      <p className="max-w-sm text-sm text-ink-soft">{meta.desc}</p>
    </Panel>
  )
}