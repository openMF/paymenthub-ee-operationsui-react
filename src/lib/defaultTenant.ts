import { TENANTS } from '@/config/constants'

// The tenant the login screen starts with, chosen in Settings and kept in this browser only.
// The tenant in use is a separate value (`tenant`), set at login and from the header.
const KEY = 'defaultTenant'

/** The saved default tenant, or null if none is saved, it isn't a known tenant, or storage is blocked. */
export function readDefaultTenant(): string | null {
  try {
    const value = localStorage.getItem(KEY)
    return value && TENANTS.includes(value) ? value : null
  } catch {
    return null
  }
}

/** Saves the default tenant. Throws if the browser refuses to store it, so the caller can say so. */
export function saveDefaultTenant(tenant: string): void {
  if (!TENANTS.includes(tenant)) throw new Error(`Unknown tenant: ${tenant}`)
  localStorage.setItem(KEY, tenant)
}
