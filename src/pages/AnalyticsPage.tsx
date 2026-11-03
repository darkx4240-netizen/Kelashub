import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Eye, Users, CalendarDays, Globe, FileText, Hash } from 'lucide-react'
import { isSupabaseConfigured, queryTable } from '../lib/data'
import { Section, Panel, EmptyHint } from '../components/Section'

interface Pageview {
  path: string
  referer: string | null
  user_agent: string | null
  visitor: string
  created_at: string
}

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function deviceOf(ua: string | null): string {
  if (!ua) return 'Tidak diketahui'
  if (/mobile|android|iphone|ipad/i.test(ua)) return 'Mobile'
  if (/tablet|ipad/i.test(ua)) return 'Tablet'
  return 'Desktop'
}

export function AnalyticsPage() {
  const [rows, setRows] = useState<Pageview[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!isSupabaseConfigured) {
      setLoading(false)
      return () => {
        active = false
      }
    }
    queryTable('pageviews', '*', { column: 'created_at', ascending: false }, 500)
      .then((r) => {
        if (!active) return
        const data = (r ?? []) as unknown as Pageview[]
        setRows(data)
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Gagal memuat data')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    if (!rows)
      return { total: 0, unique: 0, today: 0, devices: [] as [string, number][] }
    const total = rows.length
    const unique = new Set(rows.map((r) => r.visitor)).size
    const today = rows.filter((r) => isToday(r.created_at)).length
    const deviceCount = new Map<string, number>()
    for (const r of rows) {
      const d = deviceOf(r.user_agent)
      deviceCount.set(d, (deviceCount.get(d) ?? 0) + 1)
    }
    const devices = [...deviceCount.entries()].sort((a, b) => b[1] - a[1])
    return { total, unique, today, devices }
  }, [rows])

  const topPages = useMemo(() => {
    if (!rows) return [] as [string, number][]
    const m = new Map<string, number>()
    for (const r of rows) {
      const p = r.path || '/'
      m.set(p, (m.get(p) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
  }, [rows])

  const recent = useMemo(() => {
    if (!rows) return [] as Pageview[]
    return rows.slice(0, 25)
  }, [rows])

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <Section title="Statistik Kunjungan">
          <Panel>
            <EmptyHint text="Supabase belum dikonfigurasi. Statistik kunjungan butuh database terpusat." />
          </Panel>
        </Section>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-mute">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-primary" />
        Memuat statistik…
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Section title="Statistik Kunjungan">
          <Panel>
            <p className="text-sm text-red-600">Gagal memuat: {error}</p>
          </Panel>
        </Section>
      </div>
    )
  }

  const statCards: {
    label: string
    value: number
    sublabel: string
    icon: typeof Eye
    tint: string
    accent: string
  }[] = [
    { label: 'Total Kunjungan', value: stats.total, sublabel: 'Semua hit sejak awal', icon: Eye, tint: '#eef2ff', accent: '#4f46e5' },
    { label: 'Pengunjung Unik', value: stats.unique, sublabel: 'Per perangkat/browser', icon: Users, tint: '#ecfdf5', accent: '#059669' },
    { label: 'Hari Ini', value: stats.today, sublabel: 'Kunjungan hari ini', icon: CalendarDays, tint: '#fffbeb', accent: '#d97706' },
  ]

  return (
    <div className="space-y-6">
      <Section title="Statistik Kunjungan">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map((c, i) => {
            const Icon = c.icon
            return (
              <div
                key={c.label}
                className="anim-enter rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-soft/90">{c.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-ink">
                      {c.value.toLocaleString('id-ID')}
                    </p>
                    <p className="mt-1 text-xs text-mute">{c.sublabel}</p>
                  </div>
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: c.tint, color: c.accent }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Halaman Paling Sering Dikunjungi">
          <Panel className="p-0">
            {topPages.length === 0 ? (
              <div className="p-5">
                <EmptyHint text="Belum ada data kunjungan." />
              </div>
            ) : (
              <div className="divide-y divide-black/[0.04] p-2">
                {topPages.map(([path, count], i) => (
                  <div key={path} className="flex items-center gap-3 rounded-xl p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.03] text-xs font-semibold text-ink-soft">
                      {i + 1}
                    </span>
                    <FileText className="h-4 w-4 text-mute" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{path}</p>
                      <Meter count={count} max={topPages[0][1]} />
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-ink">
                      {count.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </Section>

        <Section title="Perangkat">
          <Panel className="p-0">
            {stats.devices.length === 0 ? (
              <div className="p-5">
                <EmptyHint text="Belum ada data perangkat." />
              </div>
            ) : (
              <div className="divide-y divide-black/[0.04] p-2">
                {stats.devices.map(([device, count]) => (
                  <div key={device} className="flex items-center gap-3 rounded-xl p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.03]">
                      <Globe className="h-4 w-4 text-mute" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{device}</p>
                      <Meter count={count} max={Math.max(1, stats.devices[0][1])} />
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-ink">
                      {count.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </Section>
      </div>

      <Section title="Kunjungan Terbaru" action={<BarChart3 className="h-4 w-4 text-mute" />}>
        <Panel className="p-0">
          {recent.length === 0 ? (
            <div className="p-5">
              <EmptyHint text="Belum ada kunjungan tercatat." />
            </div>
          ) : (
            <div className="divide-y divide-black/[0.04] p-2">
              {recent.map((r, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Hash className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{r.path || '/'}</p>
                    <p className="truncate text-xs text-mute">
                      {new Date(r.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                      {' · '}
                      {deviceOf(r.user_agent)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-mute">{r.visitor.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </Section>
    </div>
  )
}

function Meter({ count, max }: { count: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.04]">
      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  )
}