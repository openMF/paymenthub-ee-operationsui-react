import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import keycloak from './keycloak'
import { useToast } from '@/components/shared/ToastProvider'

const EXPIRY_CHECK_INTERVAL_MS = 60_000
const EXPIRY_WARNING_THRESHOLD_MS = 120_000

function decodeJwtPayload(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  return JSON.parse(atob(padded))
}

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
  const { toast } = useToast()
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const warnedForTokenRef = useRef<string | null>(null)

  useEffect(() => {
    // Fast path: ROPC token already in localStorage — validate expiry and skip keycloak.init()
    const existingToken = localStorage.getItem('kc_token')
    if (existingToken) {
      try {
        const payload = decodeJwtPayload(existingToken)
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

  // Poll token expiry — auto-logout when expired, warn shortly before
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('kc_token')
      if (!token) return

      try {
        const payload = decodeJwtPayload(token)
        const msUntilExpiry = payload.exp * 1000 - Date.now()

        if (msUntilExpiry < 0) {
          localStorage.removeItem('kc_token')
          setAuthenticated(false)
          navigate('/login', { replace: true })
          return
        }

        if (msUntilExpiry < EXPIRY_WARNING_THRESHOLD_MS && warnedForTokenRef.current !== token) {
          warnedForTokenRef.current = token
          toast('Your session will expire in 2 minutes', 'warning')
        }
      } catch {
        localStorage.removeItem('kc_token')
        setAuthenticated(false)
        navigate('/login', { replace: true })
      }
    }, EXPIRY_CHECK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [navigate, toast])

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
