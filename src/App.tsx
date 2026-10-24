import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { LoginPage } from './components/LoginPage'
import { TiltProvider } from './hooks/useTilt'
import { useTable } from './hooks/useData'
import { AuthProvider, useAuth } from './lib/auth'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { SettingsPage } from './pages/SettingsPage'
import { MembersPage } from './pages/MembersPage'
import {
  SchedulePage,
  TasksPage,
  MaterialsPage,
  AnnouncementsPage,
} from './pages/ContentPages'
import { isSupabaseConfigured } from './lib/data'

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  schedule: 'Jadwal Kuliah',
  tasks: 'Tugas',
  materials: 'Materi',
  announcements: 'Pengumuman',
  members: 'Anggota Kelas',
  settings: 'Pengaturan',
}

function useTables() {
  const schedules = useTable('schedules', '*', { column: 'created_at', ascending: true }, 20)
  const tasks = useTable('tasks', '*', { column: 'created_at', ascending: true }, 50)
  const materials = useTable('materials', '*', { column: 'created_at', ascending: true }, 50)
  const announcements = useTable('announcements', '*', { column: 'created_at', ascending: false }, 20)
  const members = useTable('members', '*', { column: 'created_at', ascending: true }, 100)
  const activity = useTable('activity', '*', { column: 'created_at', ascending: false }, 20)

  const tables = {
    schedules: schedules.rows,
    tasks: tasks.rows,
    materials: materials.rows,
    announcements: announcements.rows,
    members: members.rows,
    activity: activity.rows,
  }

  const refreshers = {
    schedules: schedules.refresh,
    tasks: tasks.refresh,
    materials: materials.refresh,
    announcements: announcements.refresh,
    members: members.refresh,
    activity: activity.refresh,
  }

  const live = true
  const loading =
    schedules.loading ||
    tasks.loading ||
    materials.loading ||
    announcements.loading ||
    members.loading ||
    activity.loading

  return { tables, refreshers, live, loading }
}

function AppShell() {
  const [active, setActive] = useState('dashboard')
  const [autoCreate, setAutoCreate] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { session, loading: authLoading } = useAuth()
  const { tables, refreshers, live, loading: dataLoading } = useTables()

  // Reset navigasi ke Dashboard setiap kali sesi berubah (login/logout).
  useEffect(() => {
    setActive('dashboard')
    setAutoCreate(false)
  }, [session?.id])

  // Navigasi + opsional buka form tambah (dipakai Quick Actions admin).
  function navigate(page: string, autoOpenCreate = false) {
    setActive(page)
    setAutoCreate(autoOpenCreate)
  }

  function handleAction(page: string) {
    // Quick actions: halaman yang punya "Tambah" akan langsung buka form.
    setActive(page)
    setAutoCreate(true)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-mute">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-primary" />
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  const role = session.role
  const title = PAGE_TITLES[active] ?? 'Dashboard'

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <Sidebar
        active={active}
        onNavigate={(id) => navigate(id, false)}
        role={role}
        name={session.name}
        nim={session.nim}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setSidebarOpen(true)} pageTitle={title} />

        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 md:px-8 md:py-8">
          {dataLoading ? (
            <div className="anim-enter flex items-center justify-center gap-2 py-24 text-sm text-mute">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-primary" />
              Memuat kelas…
            </div>
          ) : (
            <PageView
              active={active}
              role={role}
              name={session.name}
              tables={tables}
              refreshers={refreshers}
              live={live}
              autoCreate={autoCreate}
              onAction={handleAction}
            />
          )}
        </main>

        {!isSupabaseConfigured && (
          <footer className="px-4 pb-5 text-center text-xs text-mute">
            Data tersimpan lokal di perangkat. Isi <code className="rounded bg-black/[0.04] px-1.5 py-0.5">.env</code> dengan
            URL &amp; anon key Supabase untuk sinkron ke database.
          </footer>
        )}
      </div>
    </div>
  )
}

function PageView({
  active,
  role,
  name,
  tables,
  refreshers,
  live,
  autoCreate,
  onAction,
}: {
  active: string
  role: string
  name: string
  tables: ReturnType<typeof useTables>['tables']
  refreshers: ReturnType<typeof useTables>['refreshers']
  live: boolean
  autoCreate: boolean
  onAction: (page: string) => void
}) {
  if (active === 'settings') {
    return <SettingsPage />
  }
  if (active === 'members') {
    return (
      <MembersPage role={role} live={live} members={tables.members} refresh={refreshers.members} />
    )
  }
  if (active === 'dashboard') {
    return role === 'admin' ? (
      <AdminPage name={name} live={live} tables={tables} onAction={onAction} />
    ) : (
      <DashboardPage name={name} live={live} tables={tables} />
    )
  }
  if (active === 'schedule') {
    return (
      <SchedulePage
        role={role}
        live={live}
        rows={tables.schedules}
        refresh={refreshers.schedules}
        autoCreate={autoCreate && role === 'admin'}
      />
    )
  }
  if (active === 'tasks') {
    return (
      <TasksPage
        role={role}
        live={live}
        rows={tables.tasks}
        refresh={refreshers.tasks}
        autoCreate={autoCreate && role === 'admin'}
      />
    )
  }
  if (active === 'materials') {
    return (
      <MaterialsPage
        role={role}
        live={live}
        rows={tables.materials}
        refresh={refreshers.materials}
        autoCreate={autoCreate && role === 'admin'}
      />
    )
  }
  if (active === 'announcements') {
    return (
      <AnnouncementsPage
        role={role}
        live={live}
        rows={tables.announcements}
        refresh={refreshers.announcements}
        autoCreate={autoCreate && role === 'admin'}
      />
    )
  }

  return <PlaceholderPage id={active} />
}

export default function App() {
  return (
    <TiltProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </TiltProvider>
  )
}