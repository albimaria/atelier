import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Toast } from '../types'

type UIContextValue = {
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  toasts: Toast[]
  notify: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: string) => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, tone: Toast['tone'] = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev, { id, message, tone }])
      window.setTimeout(() => dismissToast(id), 2800)
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({
      searchOpen,
      setSearchOpen,
      cartOpen,
      setCartOpen,
      menuOpen,
      setMenuOpen,
      toasts,
      notify,
      dismissToast,
    }),
    [searchOpen, cartOpen, menuOpen, toasts, notify, dismissToast],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
