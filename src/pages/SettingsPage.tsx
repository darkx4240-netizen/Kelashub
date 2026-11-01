import { useState, type FormEvent } from 'react'
import { KeyRound, ShieldCheck, LogOut, UserRound, MessageCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { Panel } from '../components/Section'
import { waLink } from '../lib/contact'

export function SettingsPage() {
  const { session, logout, changePassword, changeStudentPin } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const isAdmin = session?.role === 'admin' && !session?.liveAuth
  const canChange = session?.liveAuth || isAdmin

  const [pinCurrent, setPinCurrent] = useState('')
  const [pinNext, setPinNext] = useState('')
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pinBusy, setPinBusy] = useState(false)

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

  async function submitPin(e: FormEvent) {
    e.preventDefault()
    setPinMsg(null)
    setPinBusy(true)
    try {
      const res = await changeStudentPin(pinCurrent, pinNext)
      if (res.ok) {
        setPinMsg({ ok: true, text: 'PIN berhasil diperbarui.' })
        setPinCurrent('')
        setPinNext('')
      } else {
        setPinMsg({ ok: false, text: res.error ?? 'Gagal mengganti PIN.' })
      }
    } finally {
      setPinBusy(false)
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
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/[0.12] text-emerald-400">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-ink">Lapor Bug / Hubungi Admin</h3>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    Ada pertanyaan atau nemu error? Chat admin langsung via WhatsApp.
                  </p>
                </div>
              </div>
              <a
                href={waLink('Halo Admin, saya mau bertanya / melaporkan bug di KelasHub.')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/[0.12]0 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                <MessageCircle className="h-4 w-4" />
                Chat Admin
              </a>
            </Panel>

            <Panel className="anim-enter p-6">
              <div className="mb-4 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-ink">Ganti Password</h3>
              </div>

        {!canChange ? (
          <p className="rounded-lg bg-white/[0.04] px-4 py-3 text-sm text-ink-soft">
            Akun mahasiswa (Mode Demo) login via NIM + PIN. Ganti PIN melalui form Ganti PIN di bawah.
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
                  className="h-11 w-full rounded-xl border border-white/[0.12] bg-surface px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                className="h-11 w-full rounded-xl border border-white/[0.12] bg-surface px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                className="h-11 w-full rounded-xl border border-white/[0.12] bg-surface px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            {msg && (
              <p
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  msg.ok ? 'bg-emerald-500/[0.12] text-emerald-400' : 'bg-rose-500/[0.12] text-rose-400'
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

      {session?.role === 'student' && !session?.liveAuth && (
        <Panel className="anim-enter p-6">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold text-ink">Ganti PIN</h3>
          </div>
          <form onSubmit={submitPin} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">
                PIN saat ini
              </span>
              <input
                type="password"
                value={pinCurrent}
                onChange={(e) => setPinCurrent(e.target.value)}
                inputMode="numeric"
                autoComplete="current-password"
                className="h-11 w-full rounded-xl border border-white/[0.12] bg-surface px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">
                PIN baru (4–6 digit)
              </span>
              <input
                type="password"
                value={pinNext}
                onChange={(e) => setPinNext(e.target.value)}
                inputMode="numeric"
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-white/[0.12] bg-surface px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            {pinMsg && (
              <p
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  pinMsg.ok ? 'bg-emerald-500/[0.12] text-emerald-400' : 'bg-rose-500/[0.12] text-rose-400'
                }`}
              >
                {pinMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={pinBusy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {pinBusy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              Simpan PIN
            </button>
          </form>
        </Panel>
      )}

      <Panel className="anim-enter p-6">
        <button
          onClick={logout}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-500/[0.12] px-5 text-sm font-semibold text-rose-400 transition-all duration-200 hover:bg-rose-500/[0.2]"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </Panel>
    </div>
  )
}