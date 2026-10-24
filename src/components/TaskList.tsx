import { AlertCircle, CheckCircle2, Clock3 } from 'lucide-react'
import { TiltCard } from './TiltCard'

export interface TaskItem {
  id: string
  title: string
  course?: string
  due?: string
  done: boolean
}

interface TaskListProps {
  items: TaskItem[]
  live: boolean
}

export function TaskList({ items, live }: TaskListProps) {
  return (
    <div className="space-y-3">
      {!live && (
        <p className="px-1 text-xs text-mute">
          Data tugas diambil dari Supabase saat terhubung.
        </p>
      )}
      {items.length === 0 && live && (
        <p className="px-1 text-sm text-mute">Tidak ada tugas.</p>
      )}
      {items.map((item, i) => (
        <TiltCard key={item.id} variant="lift" className="flex items-start gap-3 p-4">
          <span
            className={`anim-enter mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              item.done
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {item.done ? (
              <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={2.2} />
            ) : (
              <AlertCircle className="h-4.5 w-4.5" strokeWidth={2.2} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${item.done ? 'text-mute line-through' : 'text-ink'}`}>
              {item.title}
            </p>
            {item.course && (
              <p className="mt-0.5 truncate text-xs text-ink-soft">{item.course}</p>
            )}
          </div>
          {item.due && !item.done && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-medium text-ink-soft">
              <Clock3 className="h-3 w-3" />
              {item.due}
            </span>
          )}
        </TiltCard>
      ))}
    </div>
  )
}