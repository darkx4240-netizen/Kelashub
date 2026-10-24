import { isSupabaseConfigured, supabase, type DatabaseRow } from './supabase'

export type Role = 'admin' | 'student' | 'guest'

export interface StudentProfile {
  id: string
  avatar?: string
  name: string
  role: Role
}

const DEMO_PROFILE: StudentProfile = {
  id: 'demo-user',
  avatar: 'R',
  name: 'Revan Krestian',
  role: 'student',
}

export async function loadProfile(): Promise<StudentProfile> {
  if (!supabase) return DEMO_PROFILE
  const { data } = await supabase.auth.getUser()
  const meta = data.user?.user_metadata
  const role: Role =
    meta?.role === 'admin' ? 'admin' : meta?.role === 'student' ? 'student' : 'student'
  return {
    id: data.user?.id ?? 'anon',
    avatar: (meta?.full_name as string)?.slice(0, 1) ?? 'U',
    name: (meta?.full_name as string) ?? 'Mahasiswa',
    role,
  }
}

/**
 * Query wrapper: setiap tabel dibaca via RLS user Ketika (tidak hidup).
 * Kalau Supabase belum dikonfigurasi, kembalikan `null` agar pemanggil
 * menampilkan status "data demo" — bukan angka dummy yang berpura-pura nyata.
 */
export async function queryTable(
  table: string,
  select = '*',
  orderBy?: { column: string; ascending?: boolean },
  limit = 100,
): Promise<DatabaseRow[] | null> {
  if (!supabase) return null
  let q = supabase.from(table).select(select)
  if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? true })
  q = q.limit(limit)
  const { data, error } = await q
  if (error) {
    console.error(`[kelashub] query ${table} gagal:`, error.message)
    return []
  }
  return (data ?? []) as unknown as DatabaseRow[]
}

export function isLiveData(rows: DatabaseRow[] | null): boolean {
  return rows !== null
}

export { isSupabaseConfigured, supabase }
export type { DatabaseRow } from './supabase'