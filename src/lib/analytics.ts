import { isSupabaseConfigured, supabase } from './supabase'

/** ID pengunjung persisten per-browser untuk hitung 'unique visitor'. */
function visitorId(): string {
  const KEY = 'kelashub_visitor_id'
  try {
    let v = localStorage.getItem(KEY)
    if (!v) {
      v = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(KEY, v)
    }
    return v
  } catch {
    return 'anon'
  }
}

/**
 * Catat 1 kunjungan halaman ke tabel `pageviews` (Supabase).
 * No-op bila Supabase belum dikonfigurasi — tidak ada fallback lokal,
 * karena statistik kunjungan hanya bermakna saat data terpusat.
 */
export async function trackPageview(path: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  try {
    await supabase.from('pageviews').insert({
      path: path || '/',
      referer: typeof document !== 'undefined' ? (document.referrer || null) : null,
      user_agent: typeof navigator !== 'undefined' ? (navigator.userAgent || null) : null,
      visitor: visitorId(),
    })
  } catch {
    /* non-fatal: gagal tracking tidak boleh mengganggu app */
  }
}