import { BookOpen, ArrowRight } from 'lucide-react'
import { TiltCard } from './TiltCard'

export interface ActivityItem {
  id: string
  text: string
  time?: string
}

interface ActivityListProps {
  items: ActivityItem[]
  live: boolean
}

export function ActivityList({ items, live }: ActivityListProps) {
  return (
    <div className="space-y-3">
      {!live && (
        <p className="px-1 text-xs text-mute">
          Aktivitas kelas diambil dari Supabase saat terhubung.
        </p>
      )}
      {items.length === 0 && live && (
        <p className="px-1 text-sm text-mute">Belum ada aktivitas.</p>
      )}
      {items.map((item, i) => (
        <div
          key={item.id}
          className="anim-enter flex items-start gap-3"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/70" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink-soft">{item.text}</p>
            {item.time && <p className="mt-0.5 text-[11px] text-mute">{item.time}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Akses cepat materi pembelajaran — seluruhnya dari database. */
export interface MaterialQuickItem {
  id: string
  title: string
  size?: string
}

export function MaterialsQuick({
  live,
  items,
}: {
  live: boolean
  items: MaterialQuickItem[]
}) {
  return (
    <div className="space-y-3">
      {!live && (
        <p className="px-1 text-xs text-mute">
          Materi diambil dari Supabase saat terhubung.
        </p>
      )}
      {live && items.length === 0 && (
        <p className="px-1 text-sm text-mute">Belum ada materi.</p>
      )}
      {live &&
        items.map((m, i) => (
          <TiltCard key={m.id} variant="lift" className="flex items-center gap-3 p-3.5">
            <span
              className="anim-enter flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{m.title}</p>
              {m.size && <p className="text-xs text-mute">{m.size}</p>}
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-mute" />
          </TiltCard>
        ))}
    </div>
  )
}