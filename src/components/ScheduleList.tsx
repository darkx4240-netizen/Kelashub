import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { TiltCard } from './TiltCard'

export interface ScheduleItem {
  id: string
  course: string
  room?: string
  day: string
  time: string
  lecturer?: string
}

interface ScheduleListProps {
  items: ScheduleItem[]
  /** items === null artinya data demo belum dimuat */
  live: boolean
}

export function ScheduleList({ items, live }: ScheduleListProps) {
  return (
    <div className="space-y-3">
      {!live && (
        <p className="px-1 text-xs text-mute">
          Data jadwal diambil dari Supabase saat terhubung.
        </p>
      )}
      {items.length === 0 && live && (
        <p className="px-1 text-sm text-mute">Belum ada jadwal.</p>
      )}
      {items.map((item, i) => (
        <TiltCard
          key={item.id}
          variant="lift"
          className="flex items-center gap-4 p-4"
        >
          <span
            className="anim-enter flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CalendarDays className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{item.course}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-soft">
              <span>{item.day}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 text-mute" />
                {item.time}
              </span>
              {item.room && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-mute" />
                  {item.room}
                </span>
              )}
            </div>
          </div>
        </TiltCard>
      ))}
    </div>
  )
}