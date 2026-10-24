// Cek struktur + isi tiap tabel biar field di frontend pas
import { createClient } from '@supabase/supabase-js'
const sb = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
)

for (const t of ['schedules', 'tasks', 'materials', 'announcements', 'members', 'activity']) {
  const { data, error } = await sb.from(t).select('*').limit(3)
  console.log(`\n===== ${t} =====`)
  if (error) {
    console.log('ERR:', error.message)
    continue
  }
  console.log('count(sample):', data.length)
  if (data.length) {
    console.log('kolom:', Object.keys(data[0]).join(', '))
    console.log('sample:', JSON.stringify(data[0]).slice(0, 300))
  } else {
    console.log('kosong (belum ada data)')
  }
}