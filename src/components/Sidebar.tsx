import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  BookOpen,
  Megaphone,
  Users,
  Settings,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '../lib/auth'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  /** item admin-only; disembunyikan untuk mahasiswa */
  adminOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schedule', label: 'Jadwal Kuliah', icon: CalendarDays },
  { id: 'tasks', label: 'Tugas', icon: ClipboardList },
  { id: 'materials', label: 'Materi', icon: BookOpen },
  { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
  { id: 'members', label: 'Anggota Kelas', icon: Users },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
]

interface SidebarProps {
  active: string
  onNavigate: (id: string) => void
  role: Role
  name: string
  nim?: string
  open: boolean
  onClose: () => void
}

export function Sidebar({ active, onNavigate, role, name, nim, open, onClose }: SidebarProps) {
  const items = NAV_ITEMS.filter((i) => !i.adminOnly || role === 'admin')

  return (
    <>
      {/* overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-black/[0.06] bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500 text-white shadow-soft">
            <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-ink">KelasHub</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 no-scrollbar">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  onClose()
                }}
                aria-current={isActive ? 'page' : undefined}
                className={
                  `group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ` +
                  (isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-ink-soft hover:bg-black/[0.04] hover:text-ink')
                }
              >
                <Icon
                  className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110"
                  strokeWidth={2}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-black/[0.06] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-canvas p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink shadow-sm">
              {name ? name.slice(0, 2).toUpperCase() : 'KH'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{name}</p>
              <p className="truncate text-xs text-mute">
                {role === 'admin' ? 'Admin Kelas' : nim ? `NIM ${nim}` : 'Mahasiswa'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}