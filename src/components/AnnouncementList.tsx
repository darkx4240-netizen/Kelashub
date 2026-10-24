import { Megaphone, Pin } from 'lucide-react'
import { TiltCard } from './TiltCard'

export interface Announcement {
  id: string
  title: string
  body?: string
  date?: string
  pinned?: boolean
}

interface AnnouncementListProps {
  items: Announcement[]
  live: boolean
}

export function AnnouncementList({ items, live }: AnnouncementListProps) {
  return (
    <div className="space-y-3">
      {!live && (
        <p className="px-1 text-xs text-mute">
          Data pengumuman diambil dari Supabase saat terhubung.
        </p>
      )}
      {items.length === 0 && live && (
        <p className="px-1 text-sm text-mute">Belum ada pengumuman.</p>
      )}
      {items.map((item, i) => (
        <TiltCard key={item.id} variant="lift" className="p-4">
          <div className="flex items-start gap-3">
            <span
              className="anim-enter flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Megaphone className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {item.pinned && (
                  <Pin className="h-3 w-3 shrink-0 text-primary" strokeWidth={2.5} />
                )}
                <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
              </div>
              {item.body && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                  {item.body}
                </p>
              )}
              {item.date && <p className="mt-1.5 text-[11px] text-mute">{item.date}</p>}
            </div>
          </div>
        </TiltCard>
      ))}
    </div>
  )
}