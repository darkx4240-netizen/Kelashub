import { useState, type FormEvent } from 'react'
import { GraduationCap, IdCard, UserRound, KeyRound, LogIn, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'

type Tab = 'student' | 'admin' | 'supabase'

export function LoginPage() {
  const { loginStudent, loginAdmin, loginSupabase } = useAuth()
  const [tab, setTab] = useState<Tab>('student')

  const [nim, setNim] = useState('')
  const [adminUser, setAdminUser] = useState('admin')
  const [adminPass, setAdminPass] = useState('')
  const [email, setEmail] = useState('')
  const [emailPass, setEmailPass] = useState('')

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      let res
      if (tab === 'student') res = await loginStudent(nim)
      else if (tab === 'admin') res = await loginAdmin(adminUser, adminPass)
      else res = await loginSupabase(email, emailPass)
      if (!res.ok) setError(res.error ?? 'Login gagal')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-10">
      {/* dekorasi blur 3D */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
      <div aria-hidden className="float-slow pointer-events-none absolute right-16 top-20 hidden h-20 w-20 rounded-2xl border border-black/[0.05] bg-white/70 shadow-card md:block" />
      <div aria-hidden className="float-slow-x pointer-events-none absolute left-14 bottom-24 hidden h-14 w-14 rounded-xl border border-black/[0.05] bg-white/80 shadow-card md:block" />

      <div className="anim-enter relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-500 text-white shadow-soft">
            <GraduationCap className="h-6 w-6" strokeWidth={2.2} />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">KelasHub</h1>
          <p className="mt-1 text-sm text-ink-soft">Masuk ke workspace kelasmu</p>
        </div>

        <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-card-hover">
          {/* Tabs */}
          <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl bg-black/[0.04] p-1">
            <TabButton active={tab === 'student'} onClick={() => { setTab('student'); setError('') }}>
              <IdCard className="h-4 w-4" /> Mahasiswa
            </TabButton>
            <TabButton active={tab === 'admin'} onClick={() => { setTab('admin'); setError('') }}>
              <ShieldCheck className="h-4 w-4" /> Admin
            </TabButton>
            <TabButton active={tab === 'supabase'} onClick={() => { setTab('supabase'); setError('') }}>
              <UserRound className="h-4 w-4" /> Akun
            </TabButton>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {tab === 'student' && (
              <Field
                label="Nomor Induk Mahasiswa (NIM)"
                icon={<IdCard className="h-4 w-4" />}
              >
                <input
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="contoh: 19261409"
                  inputMode="numeric"
                  autoComplete="username"
                  className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 pl-9 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </Field>
            )}

            {tab === 'admin' && (
              <>
                <Field label="Username" icon={<UserRound className="h-4 w-4" />}>
                  <input
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="admin"
                    autoComplete="username"
                    className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 pl-9 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Password" icon={<KeyRound className="h-4 w-4" />}>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 pl-9 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </>
            )}

            {tab === 'supabase' && (
              <>
                <Field label="Email" icon={<UserRound className="h-4 w-4" />}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kamu@email.com"
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 pl-9 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Password" icon={<KeyRound className="h-4 w-4" />}>
                  <input
                    type="password"
                    value={emailPass}
                    onChange={(e) => setEmailPass(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 pl-9 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </>
            )}

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 disabled:opacity-60"
            >
              {busy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Masuk
            </button>
          </form>

          {tab === 'student' && (
            <p className="mt-4 text-center text-xs text-mute">
              Login pakai NIM sesuai daftar anggota kelas.
            </p>
          )}
          {tab === 'admin' && (
            <p className="mt-4 text-center text-xs text-mute">
              Default: admin · Sebadak2026 (ganti di Pengaturan setelah masuk).
            </p>
          )}
          {tab === 'supabase' && !isSupabaseConfigured && (
            <p className="mt-4 text-center text-xs text-mute">
              Supabase belum dikonfigurasi (.env). Gunakan tab Mahasiswa atau Admin dulu.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-all duration-200 ${
        active ? 'bg-white text-ink shadow-sm' : 'text-mute hover:text-ink-soft'
      }`}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-soft">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute">
          {icon}
        </span>
        {children}
      </div>
    </label>
  )
}