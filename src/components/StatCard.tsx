import type { IconType } from './iconTypes'

export interface StatItem {
  id: string
  /** jumlah total (number) atau label string ringkas */
  value: number
  label: string
  sublabel?: string
  /** Lucide icon */
  icon: IconType
  /** hex / class accent */
  accent: string
  /** soft background untuk ikon */
  tint: string
}

interface StatCardProps {
  item: StatItem
  index?: number
  /** apakah nilai berasal dari database ("live") atau placeholder demo */
  live?: boolean
}

export function StatCard({ item, index = 0, live = false }: StatCardProps) {
  const Icon = item.icon
  return (
    <div
      className={`anim-enter group relative overflow-hidden rounded-xl border border-black/[0.06] bg-white p-3.5 shadow-card transition-[transform,box-shadow] duration-220 hover:-translate-y-1 hover:shadow-card-hover md:rounded-2xl md:p-5`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-2.5 md:gap-3">
        <div>
          <p className="text-xs font-medium text-ink-soft/90 md:text-sm">{item.label}</p>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-ink md:mt-2 md:text-3xl">
            {live ? item.value.toLocaleString('id-ID') : '—'}
          </p>
          {item.sublabel && (
            <p className="mt-0.5 text-[11px] text-mute md:mt-1 md:text-xs">{item.sublabel}</p>
          )}
        </div>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg md:h-10 md:w-10 md:rounded-xl"
          style={{ backgroundColor: item.tint, color: item.accent }}
        >
          <Icon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2} />
        </span>
      </div>
      {!live && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-mute">
          <span className="h-1.5 w-1.5 rounded-full bg-mute/60" />
          Menunggu koneksi Supabase
        </div>
      )}
    </div>
  )
}