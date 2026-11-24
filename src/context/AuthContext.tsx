import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, ApiError, connect, tokenStore, type User } from '../services/api'

/** `local` users exist only in this browser (API unreachable); everyone else is a real API account. */
export type AuthUser = Pick<User, 'name' | 'email'> & { id?: number; local?: boolean }

type AuthContextValue = {
  user: AuthUser | null
  signIn: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<AuthUser>
  signInDemo: () => Promise<AuthUser>
  signOut: () => void
}

const USER_KEY = 'atelier-user'
const AuthContext = createContext<AuthContextValue | null>(null)

function readCachedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readCachedUser)

  const persist = useCallback((next: AuthUser | null) => {
    setUser(next)
    if (next) localStorage.setItem(USER_KEY, JSON.stringify(next))
    else localStorage.removeItem(USER_KEY)
  }, [])

  // Wake the API on first load and re-validate any saved session.
  useEffect(() => {
    connect().then((online) => {
      if (!online || !tokenStore.get()) return
      api
        .me()
        .then(({ user: u }) => persist({ id: u.id, name: u.name, email: u.email }))
        .catch((e) => {
          if (e instanceof ApiError && e.status === 401) {
            tokenStore.clear()
            persist(null)
          }
        })
    })
  }, [persist])

  /** Run an API auth call, or fall back to a browser-only session if the API is unreachable. */
  const withFallback = useCallback(
    async (call: () => Promise<{ token: string; user: User }>, local: AuthUser) => {
      if (await connect()) {
        const session = await call()
        tokenStore.set(session.token)
        const u = { id: session.user.id, name: session.user.name, email: session.user.email }
        persist(u)
        return u
      }
      tokenStore.clear()
      const u = { ...local, local: true }
      persist(u)
      return u
    },
    [persist],
  )

  const signIn = useCallback(
    (email: string, password: string) => withFallback(() => api.login({ email, password }), { name: email.split('@')[0], email }),
    [withFallback],
  )
  const register = useCallback(
    (name: string, email: string, password: string) => withFallback(() => api.register({ name, email, password }), { name, email }),
    [withFallback],
  )
  const signInDemo = useCallback(
    () => withFallback(() => api.demo(), { name: 'Demo Shopper', email: 'demo@atelier.dev' }),
    [withFallback],
  )
  const signOut = useCallback(() => {
    tokenStore.clear()
    persist(null)
  }, [persist])

  const value = useMemo(() => ({ user, signIn, register, signInDemo, signOut }), [user, signIn, register, signInDemo, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
