import { useState, type FormEvent } from 'react'
import { KeyRound, ShieldCheck, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { Panel } from '../components/Section'

export function SettingsPage() {
  const { session, logout, changePassword } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const isAdmin = session?.role === 'admin' && !session?.liveAuth
  const canChange = session?.liveAuth || isAdmin

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (next !== confirm) {
      setMsg({ ok: false, text: 'Konfirmasi password baru tidak cocok.' })
      return
    }
    setBusy(true)
    try {
      const res = await changePassword(current, next)
      if (res.ok) {
        setMsg({ ok: true, text: 'Password berhasil diperbarui.' })
        setCurrent('')
        setNext('')
        setConfirm('')
      } else {
        setMsg({ ok: false, text: res.error ?? 'Gagal mengganti password.' })
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Panel className="anim-enter p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <UserRound className="h-7 w-7" />
          </span>
          <div>
            <p className="text-lg font-bold text-ink">{session?.name ?? '—'}</p>
            <p className="text-sm text-ink-soft">
              {session?.role === 'admin' ? 'Admin Kelas' : 'Mahasiswa'}
              {session?.nim ? ` · NIM ${session.nim}` : ''}
              {session?.liveAuth ? ' · Supabase' : ' · Mode Demo'}
            </p>
          </div>
        </div>
      </Panel>

      <Panel className="anim-enter p-6">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-ink">Ganti Password</h3>
        </div>

        {!canChange ? (
          <p className="rounded-lg bg-black/[0.03] px-4 py-3 text-sm text-ink-soft">
            Akun mahasiswa (Mode Demo) login via NIM tanpa password. Ganti password hanya untuk
            akun admin atau akun Supabase.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {!session?.liveAuth && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-soft">
                  Password saat ini
                </span>
                <input
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">Password baru</span>
              <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">
                Konfirmasi password baru
              </span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            {msg && (
              <p
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  msg.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}
              >
                {msg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Simpan Password
            </button>
          </form>
        )}
      </Panel>

      <Panel className="anim-enter p-6">
        <button
          onClick={logout}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-50 px-5 text-sm font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-100"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </Panel>
    </div>
  )
}