/**
 * Penyimpanan file lokal via IndexedDB.
 *
 * Dipakai saat Supabase TIDAK dikonfigurasi (mode lokal). File disimpan
 * sebagai Blob langsung — bukan base64 di localStorage — sehingga:
 *  - muat file besar (ratusan MB) tanpa kena quota ~5MB localStorage,
 *  - tidak boros (base64 menambah ~33% ukuran),
 *  - tetap ada setelah refresh (persisten).
 *
 * File dirujuk lewat skema URL "localfile:<id>". Saat perlu ditampilkan,
 * panggil `resolveLocalFileUrl` untuk mendapat blob URL yang bisa dirender
 * iframe/img dan di-fetch untuk diunduh.
 */

const DB_NAME = 'kelashub_files_v1'
const STORE = 'files'
const PREFIX = 'localfile:'

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB gagal dibuka'))
  })
  return dbPromise
}

function uid(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/** True jika url merujuk file lokal di IndexedDB. */
export function isLocalFileRef(url: string | undefined | null): url is string {
  return typeof url === 'string' && url.startsWith(PREFIX)
}

function keyFromRef(ref: string): string {
  return ref.slice(PREFIX.length)
}

/** Simpan Blob file ke IndexedDB, kembalikan referensi "localfile:<id>". */
export async function putLocalFile(file: File): Promise<string> {
  const db = await openDB()
  const id = uid()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    // Simpan sebagai Blob apa adanya; type ikut terbawa.
    tx.objectStore(STORE).put(file, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('gagal menyimpan file'))
  })
  return `${PREFIX}${id}`
}

/** Ambil Blob dari IndexedDB berdasarkan referensi. */
async function getLocalBlob(ref: string): Promise<Blob | null> {
  const db = await openDB()
  const key = keyFromRef(ref)
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve((req.result as Blob) ?? null)
    req.onerror = () => reject(req.error ?? new Error('gagal membaca file'))
  })
}

/** Hapus file lokal dari IndexedDB. Aman dipanggil pada ref apa pun. */
export async function removeLocalFile(ref: string | undefined | null): Promise<void> {
  if (!isLocalFileRef(ref)) return
  const db = await openDB()
  const key = keyFromRef(ref)
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve() // non-fatal
  })
}

/**
 * Jika `url` adalah referensi file lokal, kembalikan blob URL yang bisa
 * dipakai di <iframe>/<img>/fetch. Jika bukan (URL publik Supabase),
 * kembalikan apa adanya.
 *
 * Catatan: blob URL yang dibuat sebaiknya di-revoke oleh pemanggil saat
 * tidak dipakai lagi (lihat `revokeIfBlob`).
 */
export async function resolveLocalFileUrl(url: string): Promise<string> {
  if (!isLocalFileRef(url)) return url
  const blob = await getLocalBlob(url)
  if (!blob) return url
  return URL.createObjectURL(blob)
}

/** Revoke blob URL (hasil resolve) bila memang blob URL. */
export function revokeIfBlob(url: string | undefined | null): void {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}
