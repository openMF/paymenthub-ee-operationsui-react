import Keycloak from 'keycloak-js'
import { getEnv } from '@/lib/runtime-config'

const keycloak = new Keycloak({
  url: getEnv('VITE_KEYCLOAK_URL') ?? '',
  realm: getEnv('VITE_KEYCLOAK_REALM') ?? '',
  clientId: getEnv('VITE_KEYCLOAK_CLIENT_ID') ?? '',
})

export function decodeJwtPayload(token: string) {
  const base64Url = token.split('.')[1]
  if (!base64Url) throw new Error('Invalid token')
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  return JSON.parse(atob(padded))
}

export default keycloak
