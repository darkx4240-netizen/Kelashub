import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, queryTable, type DatabaseRow } from '../lib/data'
import { store, type TableName } from '../lib/store'

export type DataSource = 'supabase' | 'local'

export interface UseTableResult {
  rows: DatabaseRow[]
  live: boolean
  loading: boolean
  source: DataSource
  refresh: () => void
}

interface OrderBy {
  column: string
  ascending?: boolean
}

/**
 * Ambil isi tabel. Prioritas: Supabase bila dikonfigurasi; jika tidak,
 * fallback ke store lokal (localStorage) yang bisa di-CRUD.
 * `refresh()` memicu pembacaan ulang (dipakai setelah mutasi).
 */
export function useTable(
  table: string,
  select = '*',
  orderBy?: OrderBy,
  limit = 100,
): UseTableResult {
  // Destructure ke primitif agar dependency effect stabil (hindari infinite loop
  // akibat object literal baru setiap render).
  const orderColumn = orderBy?.column
  const orderAscending = orderBy?.ascending ?? true

  const [state, setState] = useState<Omit<UseTableResult, 'refresh'>>({
    rows: [],
    live: false,
    loading: true,
    source: isSupabaseConfigured ? 'supabase' : 'local',
  })

  const load = useCallback(() => {
    if (isSupabaseConfigured) {
      setState((s) => ({ ...s, loading: true }))
      void queryTable(
        table,
        select,
        { column: orderColumn ?? 'created_at', ascending: orderAscending },
        limit,
      ).then((rows) => {
        setState({ rows: rows ?? [], live: rows !== null, loading: false, source: 'supabase' })
      })
      return
    }
    setState({ rows: store.list(table as TableName), live: true, loading: false, source: 'local' })
  }, [table, select, orderColumn, orderAscending, limit])

  useEffect(() => {
    if (isSupabaseConfigured) {
      load()
      return
    }
    // local: baca + subscribe store untuk refleksi CRUD otomatis
    load()
    return store.subscribe(load)
  }, [load])

  const refresh = useCallback(() => load(), [load])

  return { ...state, refresh }
}