import type { ReactNode } from 'react'

interface SectionProps {
  id?: string
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Section({ id, title, action, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`min-w-0 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight text-ink">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Panel putih dengan border + shadow lembut (non-tilt). */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card ${className}`}
    >
      {children}
    </div>
  )
}

/** Daftar item dengan keterangan "loading" atau kosong. */
export function EmptyHint({ text = 'Belum ada data' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-black/[0.02] px-4 py-3 text-sm text-mute">
      <span className="h-1.5 w-1.5 rounded-full bg-mute/50" />
      {text}
    </div>
  )
}