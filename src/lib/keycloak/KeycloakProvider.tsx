import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import keycloak from './keycloak'

interface KeycloakContextValue {
  keycloak: typeof keycloak
  authenticated: boolean
  token: string | undefined
  logout: () => void
}

const KeycloakContext = createContext<KeycloakContextValue | null>(null)

export function useKeycloak() {
  const ctx = useContext(KeycloakContext)
  if (!ctx) throw new Error('useKeycloak must be used inside KeycloakProvider')
  return ctx
}

export default function KeycloakProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    // Fast path: ROPC token already in localStorage — validate expiry and skip keycloak.init()
    const existingToken = localStorage.getItem('kc_token')
    if (existingToken) {
      try {
        const payload = JSON.parse(atob(existingToken.split('.')[1]))
        if (payload.exp * 1000 > Date.now()) {
          setAuthenticated(true)
          setInitialized(true)
          return
        } else {
          localStorage.removeItem('kc_token')
        }
      } catch {
        localStorage.removeItem('kc_token')
      }
    }

    if (keycloak.didInitialize) {
      setAuthenticated(keycloak.authenticated ?? false)
      if (keycloak.token) localStorage.setItem('kc_token', keycloak.token)
      setInitialized(true)
      return
    }

    keycloak
      .init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        pkceMethod: 'S256',
      })
      .then((auth) => {
        console.log('Auth status:', auth)
        setAuthenticated(auth)
        if (auth && keycloak.token) {
          localStorage.setItem('kc_token', keycloak.token)
        } else {
          localStorage.removeItem('kc_token')
          navigate('/login', { replace: true })
        }
        setInitialized(true)
      })
      .catch((err) => {
        console.error('Keycloak init error:', err)
        setInitialized(true)
        navigate('/login', { replace: true })
      })

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(60).then((refreshed) => {
        if (refreshed && keycloak.token) {
          localStorage.setItem('kc_token', keycloak.token)
        }
      }).catch(() => {
        localStorage.removeItem('kc_token')
        keycloak.logout()
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function logout() {
    localStorage.removeItem('kc_token')
    keycloak.logout({ redirectUri: `${window.location.origin}/login` })
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#1565C0] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Initializing session…</p>
        </div>
      </div>
    )
  }

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated, token: keycloak.token, logout }}>
      {children}
    </KeycloakContext.Provider>
  )
}
