import { useTilt } from '../hooks/useTilt'
import {
  CalendarDays,
  ClipboardList,
  Clock,
  Sparkles,
  ChevronRight,
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
 * Hero 3D: kartu sapaan dengan lapisan permukaan bertumpuk (layered),
 * tilt ikut pointer, dan elemen dekoratif melayang lambat.
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

  const greeting =
    live && pendingTasks !== null
      ? `Ada ${pendingTasks} tugas menanti`
      : 'Tugas kamu sudah terhubung ke kelas'
  const classInfo =
    live && todayClasses !== null
      ? `${todayClasses} kelas dijadwalkan hari ini`
      : 'Jadwal hari ini siap dilihat'

  return (
    <section
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={style}
      className="anim-enter preserve-3d relative overflow-hidden rounded-2xl border border-black/[0.06] bg-gradient-to-br from-white via-indigo-50/40 to-white p-4 shadow-soft md:rounded-3xl md:p-8"
    >
      {/* dekorasi blur lembut */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl"
      />

      {/* lapisan 3D dekoratif */}
      <div
        aria-hidden
        className="float-slow pointer-events-none absolute right-10 top-10 hidden h-24 w-24 rounded-2xl border border-black/[0.05] bg-white/70 shadow-card backdrop-blur sm:block"
        style={{ transform: 'translateZ(40px)' }}
      />
      <div
        aria-hidden
        className="float-slow-x pointer-events-none absolute right-24 top-24 hidden h-14 w-14 rounded-xl border border-black/[0.05] bg-white/80 shadow-card backdrop-blur md:block"
        style={{ transform: 'translateZ(70px)' }}
      />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-5">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-ink-soft shadow-sm ring-1 ring-black/[0.05]">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {today}
          </span>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-ink md:mt-4 md:text-3xl">
            Halo, {name} 👋
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft md:mt-2 md:text-[15px]">
            Selamat datang kembali di workspace kelasmu.{' '}
            {greeting}
            {live && todayClasses !== null && ` dan ${classInfo.toLowerCase()}.`}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#jadwal"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0"
            >
              <CalendarDays className="h-4 w-4" />
              Lihat Jadwal
            </a>
            <a
              href="#tugas"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm ring-1 ring-black/[0.06] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
            >
              <ClipboardList className="h-4 w-4" />
              Tugas Saya
            </a>
          </div>
        </div>

        {/* mini-card jadwal berikutnya */}
        <div
          className="preserve-3d relative w-full max-w-[240px] rounded-2xl border border-black/[0.06] bg-white/80 p-4 shadow-card backdrop-blur"
          style={{ transform: 'translateZ(55px)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-mute">
            Kelas berikutnya
          </p>
          <div className="mt-3 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Clock className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {live && nextClass ? nextClass.course : 'Menunggu jadwal'}
              </p>
              <p className="text-xs text-ink-soft">
                {live && nextClass ? nextClass.time : 'Terhubung ke kelasmu'}
              </p>
              <p className="mt-1 text-xs text-mute">
                {live && nextClass?.room ? nextClass.room : 'Data diambil dari Supabase'}
              </p>
            </div>
          </div>
          <a href="#jadwal" className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
            Jadwal lengkap <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}