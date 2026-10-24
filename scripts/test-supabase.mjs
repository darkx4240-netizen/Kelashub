// Test koneksi Supabase: cek auth session + coba query tabel (kalau belum ada tabel akan error "relation does not exist")
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
console.log('URL:', url)
console.log('KEY prefix:', key?.slice(0, 12) + '…')

const sb = createClient(url, key)

// 1) auth ping
const { data: authData, error: authErr } = await sb.auth.getSession()
console.log('auth.getSession ->', authErr ? 'ERR ' + authErr.message : 'OK (no session, expected)')

// 2) coba hit tabel publik (cek apakah schema sudah ada)
for (const t of ['schedules', 'tasks', 'materials', 'announcements', 'members', 'activity']) {
  const { error } = await sb.from(t).select('id', { count: 'exact', head: true })
  console.log(`table "${t}" ->`, error ? `ERR: ${error.message}` : 'OK')
}