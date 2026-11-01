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
  loginStudent: (nim: string, pin: string) => Promise<AuthResult>
      loginSupabase: (email: string, password: string) => Promise<AuthResult>
    logout: () => void
    changePassword: (current: string, next: string) => Promise<AuthResult>
    changeStudentPin: (current: string, next: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = 'kelashub_session'
const SESSION_EXPIRY_KEY = 'kelashub_session_expiry'
const SESSION_TTL_MS = 15 * 60 * 1000 // 15 menit idle sebelum auto-logout
const STUDENT_PIN_KEY = 'kelashub_student_pins'

function defaultStudentPin(nim: string): string {
  return nim.replace(/\D/g, '').slice(-4)
}

function readStudentPins(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STUDENT_PIN_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStudentPins(pins: Record<string, string>) {
  try {
    localStorage.setItem(STUDENT_PIN_KEY, JSON.stringify(pins))
  } catch {
    /* ignore */
  }
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const expiry = Number(localStorage.getItem(SESSION_EXPIRY_KEY) ?? 0)
    // Sesi kedaluwarsa (idle terlalu lama) → anggap tidak ada.
    if (expiry && Date.now() > expiry) {
      clearSession()
      return null
    }
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function writeSession(s: Session | null) {
  try {
    if (s) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s))
      localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_TTL_MS))
    } else {
      clearSession()
    }
  } catch {
    /* ignore quota/private-mode */
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_EXPIRY_KEY)
  } catch {
    /* ignore */
  }
}

function touchSession() {
  // Perpanjang masa aktif saat ada aktivitas user (cek tiap kali boot/aksi).
  try {
    if (localStorage.getItem(SESSION_KEY)) {
      localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_TTL_MS))
    }
  } catch {
    /* ignore */
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
        // Cek TTL sesi lokal dulu. Kalau kedaluwarsa (idle > TTL), bersihkan
        // semua termasuk sesi Supabase, supaya link dari perangkat lain tidak
        // langsung masuk sebagai admin tanpa login ulang.
        const local = readSession()
        if (!local) {
          if (supabase) await supabase.auth.signOut().catch(() => {})
          if (active) setLoading(false)
          return
        }
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
        if (active && !liveSession && local) {
          setSession(local)
        }
        if (active) setLoading(false)
      })().catch(() => {
        if (active) setLoading(false)
      })
      return () => {
        active = false
      }
    }, [])

  const loginStudent = useCallback(async (nimInput: string, pinInput: string): Promise<AuthResult> => {
      const nim = nimInput.trim()
      const pin = pinInput.trim()
      const match = ROSTER.find((s) => s.nim === nim)
      if (!match) {
        return { ok: false, error: 'NIM tidak ditemukan di daftar kelas.' }
      }
      if (!pin) {
        return { ok: false, error: 'PIN wajib diisi.' }
      }
      const pins = readStudentPins()
      const expected = pins[nim] ?? defaultStudentPin(nim)
      if (pin !== expected) {
        return { ok: false, error: 'PIN salah.' }
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

  // Idle auto-logout: tutup sesi bila tak ada aktivitas selama TTL.
  useEffect(() => {
    if (!session) return
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    let timer = window.setTimeout(logout, SESSION_TTL_MS)
    const reset = () => {
      window.clearTimeout(timer)
      touchSession()
      timer = window.setTimeout(logout, SESSION_TTL_MS)
    }
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    return () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [session, logout])

  const changePassword = useCallback(
    async (_current: string, next: string): Promise<AuthResult> => {
      if (next.length < 6) {
        return { ok: false, error: 'Password baru minimal 6 karakter.' }
      }
      if (!supabase) return { ok: false, error: 'Server belum tersedia.' }
      const { error } = await supabase.auth.updateUser({ password: next })
      return error ? { ok: false, error: error.message } : { ok: true }
    },
    [session],
  )

  const changeStudentPin = useCallback(
          async (current: string, next: string): Promise<AuthResult> => {
            if (session?.role !== 'student') {
              return { ok: false, error: 'Hanya mahasiswa yang bisa mengganti PIN.' }
            }
            const nim = session.nim
            if (!nim) {
              return { ok: false, error: 'Sesi mahasiswa tidak punya NIM.' }
            }
            if (!/^\d{4,6}$/.test(next)) {
              return { ok: false, error: 'PIN baru harus 4–6 digit angka.' }
            }
            const pins = readStudentPins()
            const expected = pins[nim] ?? defaultStudentPin(nim)
            if (current.trim() !== expected) {
              return { ok: false, error: 'PIN saat ini salah.' }
            }
            writeStudentPins({ ...pins, [nim]: next })
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
            loginSupabase,
            logout,
            changePassword,
            changeStudentPin,
          }),
          [session, loading, liveAuth, loginStudent, loginSupabase, logout, changePassword, changeStudentPin],
        )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}