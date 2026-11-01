import { useTilt } from '../hooks/useTilt'
import {
  CalendarDays,
  ClipboardList,
  Clock,
  Terminal,
  ChevronRight,
  Cpu,
  Database,
  Wifi,
} from 'lucide-react'

export interface HeroMeta {
  name: string
  /** jumlah tugas belum selesai (dari Supabase) */
  pendingTasks: number | null
  /** jumlah kelas hari ini (dari Supabase) */
  todayClasses: number | null
  /** jadwal berikutnya (dari Supabase) */
  nextClass?: { course: string; time: string; room?: string } | null
  live: boolean
}

/**
 * Hero bergaya terminal/hacker — nyambung sama tema Sistem Informasi.
 * Seluruh angka diambil dari database; tidak ada angka dummy.
 */
export function Hero({ name, pendingTasks, todayClasses, nextClass, live }: HeroMeta) {
  const { style, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>(5)

  const today = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const clock = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const userName = name || 'student'
  const host = `${userName.toLowerCase().replace(/[^a-z0-9]/g, '_')}@kelashub`

  const taskLine =
    live && pendingTasks !== null
      ? `task --pending  →  ${pendingTasks} tugas menanti`
      : `task --sync  →  terhubung ke kelas`

  const classLine =
    live && todayClasses !== null
      ? `schedule --today  →  ${todayClasses} kelas terjadwal`
      : `schedule --load  →  jadwal siap`

  return (
    <section
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={style}
      className="anim-enter preserve-3d relative overflow-hidden rounded-2xl border border-primary/20 shadow-card neon-glow md:rounded-3xl"
    >
      {/* dekorasi grid + glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
      />

      {/* terminal window */}
      <div className="relative flex flex-col">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-primary/15 bg-surface/70 px-4 py-2.5 backdrop-blur">
          <span className="h-3 w-3 rounded-full bg-rose-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 inline-flex items-center gap-1.5 font-mono text-xs text-ink-soft">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            {host}:~/portal_si
          </span>
          <span className="ml-auto hidden font-mono text-[11px] text-mute sm:inline">
            {today} · {clock}
          </span>
        </div>

        {/* terminal body */}
        <div className="relative z-10 p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="min-w-0 max-w-xl flex-1">
              {/* boot status */}
              <p className="font-mono text-xs leading-relaxed text-mute">
                <span className="text-emerald-400">●</span> boot: portal mahasiswa SI initialized
              </p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-mute">
                <span className={live ? 'text-emerald-400' : 'text-amber-400'}>●</span>{' '}
                {live ? 'db: supabase linked' : 'db: local fallback'}
              </p>

              <h2 className="mt-3 font-mono text-xl font-bold tracking-tight text-ink md:text-2xl">
                <span className="neon-text text-primary">$</span>{' '}
                <span className="text-ink">halo</span>{' '}
                <span className="text-primary">{name}!</span>
              </h2>
              <p className="mt-2 font-mono text-sm leading-relaxed text-ink-soft">
                <span className="select-none text-mute">{'// '}</span>
                Selamat datang kembali di workspace akademik Sistem Informasi.
              </p>

              <div className="mt-3 space-y-1 font-mono text-sm text-ink-soft">
                <p className="truncate">
                  <span className="select-none text-primary">{'$ '}</span>
                  {taskLine}
                </p>
                <p className="truncate">
                  <span className="select-none text-primary">{'$ '}</span>
                  {classLine}
                </p>
                <p className="truncate">
                  <span className="select-none text-mute">{'$ '}</span>
                  <span className="text-mute">help --menu  →  pilih modul di bawah</span>
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="#jadwal"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-mono text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0"
                >
                  <CalendarDays className="h-4 w-4" />
                  ./jadwal
                </a>
                <a
                  href="#tugas"
                  className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 font-mono text-sm font-semibold text-ink ring-1 ring-white/[0.08] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.04]"
                >
                  <ClipboardList className="h-4 w-4" />
                  ./tugas
                </a>
              </div>
            </div>

            {/* mini-card jadwal berikutnya */}
            <div
              className="preserve-3d relative w-full max-w-[260px] rounded-2xl border border-primary/20 bg-surface/80 p-4 shadow-card backdrop-blur"
              style={{ transform: 'translateZ(55px)' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs font-semibold uppercase tracking-wide text-mute">
                  next_class
                </p>
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Cpu className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-semibold text-ink">
                    {live && nextClass ? nextClass.course : 'standby'}
                  </p>
                  <p className="font-mono text-xs text-ink-soft">
                    {live && nextClass ? nextClass.time : 'menunggu jadwal'}
                  </p>
                  <p className="mt-1 font-mono text-xs text-mute">
                    {live && nextClass?.room ? nextClass.room : 'src: supabase'}
                  </p>
                </div>
              </div>
              <a
                href="#jadwal"
                className="mt-4 flex items-center gap-1 font-mono text-xs font-semibold text-primary"
              >
                full_log --all <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* footer status strip */}
        <div className="relative flex items-center gap-3 border-t border-primary/15 bg-surface/50 px-4 py-2 font-mono text-[11px] text-mute backdrop-blur">
          <span className="inline-flex items-center gap-1">
            <Wifi className="h-3 w-3 text-emerald-400" /> {live ? 'online' : 'offline'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Database className="h-3 w-3 text-primary" /> supabase
          </span>
          <span className="ml-auto hidden sm:inline">v1.0 · sistem informasi</span>
        </div>
      </div>
    </section>
  )
}