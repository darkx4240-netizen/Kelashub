// Kontrol izin login mahasiswa — hanya admin yang mengubah.
// Status blokir disimpan per NIM di localStorage. Admin (login via
// email/Supabase) tidak terpengaruh karena tidak punya NIM.
const ACCESS_KEY = 'kelashub_login_access_v1'

export type AccessMap = Record<string, boolean>

export function getBlockedMap(): AccessMap {
  try {
    const raw = localStorage.getItem(ACCESS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as AccessMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAccess(map: AccessMap) {
  try {
    localStorage.setItem(ACCESS_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function isBlocked(nim: string): boolean {
  return Boolean(getBlockedMap()[nim])
}

export function setBlocked(nim: string, blocked: boolean): void {
  const map = getBlockedMap()
  if (blocked) map[nim] = true
  else delete map[nim]
  writeAccess(map)
}

export function setManyBlocked(nims: string[], blocked: boolean): void {
  const map = getBlockedMap()
  for (const n of nims) {
    if (!n) continue
    if (blocked) map[n] = true
    else delete map[n]
  }
  writeAccess(map)
}