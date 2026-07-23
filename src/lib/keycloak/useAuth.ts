import { useKeycloak } from './KeycloakProvider'

interface AuthUser {
  name: string
  email: string
  username: string
}

interface UseAuthReturn {
  authenticated: boolean
  token: string | undefined
  user: AuthUser | null
  logout: () => void
  hasRole: (role: string) => boolean
}

export function useAuth(): UseAuthReturn {
  const { keycloak, authenticated, token, logout } = useKeycloak()

  const tokenParsed = keycloak.tokenParsed as Record<string, unknown> | undefined

  const user: AuthUser | null = tokenParsed
    ? {
        name: (tokenParsed['name'] as string) ?? (tokenParsed['preferred_username'] as string) ?? '',
        email: (tokenParsed['email'] as string) ?? '',
        username: (tokenParsed['preferred_username'] as string) ?? '',
      }
    : null

  function hasRole(role: string): boolean {
    return keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role)
  }

  return { authenticated, token, user, logout, hasRole }
}
