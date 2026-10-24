import { Menu, Bell, Search } from 'lucide-react'

interface TopbarProps {
  onMenu: () => void
  pageTitle: string
}

export function Topbar({ onMenu, pageTitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-black/[0.05] bg-canvas/80 px-4 backdrop-blur-md md:px-8">
      <button
        onClick={onMenu}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-black/[0.05] md:hidden"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink md:text-base">
        {pageTitle}
      </h1>

      <button
        className="hidden h-9 items-center gap-2 rounded-lg bg-white px-3 text-sm text-mute shadow-sm ring-1 ring-black/[0.06] transition hover:text-ink-soft sm:flex"
        aria-label="Cari"
      >
        <Search className="h-4 w-4" />
        <span>Cari…</span>
      </button>

      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-black/[0.05]"
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-canvas" />
      </button>
    </header>
  )
}