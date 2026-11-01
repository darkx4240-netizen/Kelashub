import { useEffect, useMemo, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import type { DatabaseRow } from '../lib/data'
import { insertRow, deleteRow } from '../lib/mutations'

interface ForumPageProps {
  role: string
  name: string
  live: boolean
  discussions: DatabaseRow[]
  replies: DatabaseRow[]
  refresh: () => void
}

interface Msg {
  id: string
  table: 'discussions' | 'replies'
  author: string
  role: string
  content: string
  at: number
}

function parseTime(isoStr: unknown): number {
  if (typeof isoStr !== 'string' || !isoStr) return 0
  const t = Date.parse(isoStr)
  return Number.isNaN(t) ? 0 : t
}

function fmtClock(isoStr: unknown): string {
  const t = parseTime(isoStr)
  if (!t) return ''
  return new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function dayLabel(isoStr: unknown): string {
  const t = parseTime(isoStr)
  if (!t) return ''
  const d = new Date(t)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (same(d, today)) return 'Hari ini'
  if (same(d, yesterday)) return 'Kemarin'
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-fuchsia-500',
  'bg-teal-500',
  'bg-orange-500',
]

function avatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export function ForumPage({ role, name, live, discussions, replies, refresh }: ForumPageProps) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const messages = useMemo<Msg[]>(() => {
    const merged: Msg[] = [
      ...discussions.map((d) => ({
        id: String(d.id),
        table: 'discussions' as const,
        author: String(d.author ?? '?'),
        role: String(d.author_role ?? 'student'),
        content: String(d.content ?? ''),
        at: parseTime(d.created_at),
      })),
      ...replies.map((r) => ({
        id: String(r.id),
        table: 'replies' as const,
        author: String(r.author ?? '?'),
        role: String(r.author_role ?? 'student'),
        content: String(r.content ?? ''),
        at: parseTime(r.created_at),
      })),
    ]
    return merged
      .filter((m) => m.content.trim() && m.at > 0)
      .sort((a, b) => a.at - b.at)
  }, [discussions, replies])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  async function send() {
    const c = text.trim()
    if (!c || busy) return
    setBusy(true)
    setError('')
    const res = await insertRow('discussions', {
      title: c.length > 80 ? c.slice(0, 80) + '…' : c,
      content: c,
      author: name,
      author_role: role,
    })
    setBusy(false)
    if (!res.ok) {
      setError(res.error ?? 'Gagal mengirim pesan.')
      return
    }
    setText('')
    refresh()
  }

  async function remove(msg: Msg) {
    const ok = window.confirm('Hapus pesan ini?')
    if (!ok) return
    const res = await deleteRow(msg.table, msg.id)
    if (res.ok) refresh()
  }

  const rowClassName = (mine: boolean) => (mine ? 'justify-end' : 'justify-start')

  return (
    <div className="flex h-[calc(100dvh-10rem)] min-h-[420px] flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">Obrolan Kelas</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {messages.length} pesan {!live && <span className="text-mute">· data demo</span>}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card">
        <div className="flex-1 overflow-y-auto px-3 py-4 md:px-5">
          {messages.length === 0 ? (
            <p className="py-16 text-center text-sm text-mute">
              Belum ada pesan. Mulai obrolan pertama!
            </p>
          ) : (
            <div className="space-y-2">
              {messages.map((m, i) => {
                const mine = m.author === name
                const showDay = i === 0 || dayLabel(messages[i - 1].at) !== dayLabel(m.at)
                const canDelete = role === 'admin' || mine
                return (
                  <div key={m.id}>
                    {showDay && (
                      <div className="my-3 flex justify-center">
                        <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[11px] font-medium text-mute">
                          {dayLabel(m.at)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${rowClassName(mine)}`}>
                      {!mine && (
                        <span
                          className={`mt-4 flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(m.author)}`}
                        >
                          {m.author.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div
                        className={`flex flex-col ${mine ? 'items-end' : 'ml-2 items-start'} max-w-[78%]`}
                      >
                        {!mine && (
                          <span className="mb-0.5 px-1 text-[11px] font-medium text-mute">
                            {m.author}
                          </span>
                        )}
                        <div
                          className={`group relative whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                            mine
                              ? 'rounded-br-sm bg-primary text-white'
                              : 'rounded-bl-sm border border-black/[0.05] bg-white text-ink shadow-sm'
                          }`}
                        >
                          {m.content}
                          <span
                            className={`mt-0.5 block text-right text-[10px] ${
                              mine ? 'text-white/70' : 'text-mute'
                            }`}
                          >
                            {fmtClock(m.at)}
                          </span>
                        </div>
                        {canDelete && (
                          <button
                            onClick={() => remove(m)}
                            aria-label="Hapus pesan"
                            className="mt-0.5 hidden px-1 text-[11px] text-rose-500 hover:underline group-hover:block"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-black/[0.06] bg-white px-3 py-3 md:px-4">
          {error && (
            <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
              {error}
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              rows={1}
              placeholder="Ketik pesan…"
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-black/[0.1] bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => void send()}
              disabled={busy || !text.trim()}
              aria-label="Kirim"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-mute">
            Tercatat sebagai {name} ({role === 'admin' ? 'Admin' : 'Mahasiswa'}) · Enter kirim, Shift+Enter baris baru
          </p>
        </div>
      </div>
    </div>
  )
}