import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isSupabaseConfigured, supabase } from './supabase'
import { ROSTER } from './roster'

export type Role = 'admin' | 'student'

export interface Session {
  id: string
  name: string
  role: Role
  nim?: string
  /** true bila sesi diverifikasi Supabase (live), false bila demo lokal */
  liveAuth: boolean
}

interface AuthResult {
  ok: boolean
  error?: string
}

interface AuthContextValue {
  session: Session | null
  loading: boolean
  live: boolean
  loginStudent: (nim: string) => Promise<AuthResult>
  loginAdmin: (username: string, password: string) => Promise<AuthResult>
  loginSupabase: (email: string, password: string) => Promise<AuthResult>
  logout: () => void
  changePassword: (current: string, next: string) => Promise<AuthResult>
  hasAdminPassword: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = 'kelashub_session'
const ADMIN_PW_KEY = 'kelashub_admin_pw_hash'
const DEFAULT_ADMIN_USER = 'admin'
const DEFAULT_ADMIN_PASSWORD = 'Sebadak2026'

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function writeSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore quota/private-mode */
  }
}

function readAdminHash(): string | null {
  try {
    return localStorage.getItem(ADMIN_PW_KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [liveAuth, setLiveAuth] = useState(false)

  // Boot: cek sesi lokal + (bila live) sesi Supabase
  useEffect(() => {
    let active = true
    ;(async () => {
      let liveSession = false
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession()
        const u = data.session?.user
        if (u) {
          const meta = u.user_metadata as Record<string, unknown>
          const role: Role = meta?.role === 'admin' ? 'admin' : 'student'
          if (active)
            setSession({
              id: u.id,
              name: (meta?.full_name as string) ?? u.email ?? 'Mahasiswa',
              role,
              liveAuth: true,
            })
          setLiveAuth(true)
          liveSession = true
        }
      }
      if (active && !liveSession) {
        const local = readSession()
        if (local) setSession(local)
      }
      if (active) setLoading(false)
    })().catch(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const loginStudent = useCallback(async (nimInput: string): Promise<AuthResult> => {
    const nim = nimInput.trim()
    const match = ROSTER.find((s) => s.nim === nim)
    if (!match) {
      return { ok: false, error: 'NIM tidak ditemukan di daftar kelas.' }
    }
    const s: Session = {
      id: `nim-${nim}`,
      name: match.name,
      role: 'student',
      nim,
      liveAuth: false,
    }
    setSession(s)
    writeSession(s)
    return { ok: true }
  }, [])

  const loginAdmin = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    const u = username.trim().toLowerCase()
    if (u !== DEFAULT_ADMIN_USER) {
      return { ok: false, error: 'Username admin tidak dikenal.' }
    }
    const stored = readAdminHash() ?? (await sha256(DEFAULT_ADMIN_PASSWORD))
    const inputHash = await sha256(password)
    if (inputHash !== stored) {
      return { ok: false, error: 'Password salah.' }
    }
    const s: Session = {
      id: 'admin',
      name: 'Vandha',
      role: 'admin',
      liveAuth: false,
    }
    setSession(s)
    writeSession(s)
    return { ok: true }
  }, [])

  const loginSupabase = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { ok: false, error: 'Supabase belum dikonfigurasi.' }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) {
        return { ok: false, error: error?.message ?? 'Login gagal.' }
      }
      const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>
      const role: Role = meta?.role === 'admin' ? 'admin' : 'student'
      const s: Session = {
        id: data.user.id,
        name: (meta?.full_name as string) ?? email,
        role,
        liveAuth: true,
      }
      setSession(s)
      writeSession(s)
      setLiveAuth(true)
      return { ok: true }
    },
    [],
  )

  const logout = useCallback(() => {
    setSession(null)
    writeSession(null)
    if (supabase) void supabase.auth.signOut()
  }, [])

  const changePassword = useCallback(
    async (current: string, next: string): Promise<AuthResult> => {
      if (next.length < 6) {
        return { ok: false, error: 'Password baru minimal 6 karakter.' }
      }
      if (session?.liveAuth) {
        if (!supabase) return { ok: false, error: 'Supabase belum dikonfigurasi.' }
        const { error } = await supabase.auth.updateUser({ password: next })
        return error ? { ok: false, error: error.message } : { ok: true }
      }
      // demo lokal: verifikasi password admin saat ini
      if (session?.role !== 'admin') {
        return { ok: false, error: 'Hanya admin yang bisa mengganti password.' }
      }
      const stored = readAdminHash() ?? (await sha256(DEFAULT_ADMIN_PASSWORD))
      const curHash = await sha256(current)
      if (curHash !== stored) {
        return { ok: false, error: 'Password saat ini salah.' }
      }
      try {
        localStorage.setItem(ADMIN_PW_KEY, await sha256(next))
      } catch {
        /* ignore */
      }
      return { ok: true }
    },
    [session],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      live: isSupabaseConfigured && liveAuth,
      loginStudent,
      loginAdmin,
      loginSupabase,
      logout,
      changePassword,
      hasAdminPassword: true,
    }),
    [session, loading, liveAuth, loginStudent, loginAdmin, loginSupabase, logout, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}