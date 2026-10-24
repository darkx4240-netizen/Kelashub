import { isSupabaseConfigured, supabase, type DatabaseRow } from './supabase'
import { store, type TableName } from './store'
import { putLocalFile, removeLocalFile } from './fileStore'

export interface MutResult {
  ok: boolean
  error?: string
}

/** Insert: Supabase bila live, fallback store lokal. */
export async function insertRow(table: TableName, row: Record<string, unknown>): Promise<MutResult> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(table).insert(row)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }
  store.insert(table, row)
  return { ok: true }
}

export async function updateRow(
  table: TableName,
  id: string,
  patch: Record<string, unknown>,
): Promise<MutResult> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(table).update(patch).eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }
  store.update(table, id, patch)
  return { ok: true }
}

export async function deleteRow(table: TableName, id: string): Promise<MutResult> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }
  store.remove(table, id)
  return { ok: true }
}

/** Hapus file dari storage bucket "materials" (Supabase) atau IndexedDB (lokal). */
export async function deleteMaterialFile(path: string): Promise<void> {
  if (!path) return
  // Mode lokal: referensi "localfile:<id>" di IndexedDB.
  if (!isSupabaseConfigured || !supabase) {
    await removeLocalFile(path)
    return
  }
  try {
    await supabase.storage.from('materials').remove([path])
  } catch {
    /* non-fatal */
  }
}

/**
 * Upload file ke Storage Bucket "materials" (public) milik Supabase.
 * `folder` menentukan sub-path (mis. "materials" atau "tasks").
 * Mengembalikan URL publik yang bisa di-download siapa pun.
 */
export async function uploadMaterialFile(
  file: File,
  userId: string,
  folder = 'materials',
): Promise<MutResult & { url?: string; path?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // fallback lokal: simpan Blob ke IndexedDB (bukan base64 di localStorage,
    // yang gampang kena quota ~5MB dan bikin data hilang saat refresh).
    const ref = await putLocalFile(file)
    return { ok: true, url: ref, path: ref }
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_ ]/g, '_').trim()
  const path = `${folder}/${userId}/${Date.now()}_${safeName}`
  const { data, error } = await supabase.storage
    .from('materials')
    .upload(path, file, { upsert: true, contentType: file.type || 'application/octet-stream' })

  if (error) return { ok: false, error: error.message }

  const base = import.meta.env.VITE_SUPABASE_URL as string
  const publicUrl = `${base}/storage/v1/object/public/materials/${data.path}`
  return { ok: true, url: publicUrl, path: data.path }
}

export type { DatabaseRow, TableName }