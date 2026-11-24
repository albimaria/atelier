import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'atelier-wishlist'

type WishlistContextValue = {
  ids: string[]
  toggle: (productId: string) => boolean
  has: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setIds(readIds())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [ids, ready])

  const toggle = useCallback((productId: string) => {
    const exists = ids.includes(productId)
    setIds((prev) => (exists ? prev.filter((id) => id !== productId) : [...prev, productId]))
    return !exists
  }, [ids])

  const has = useCallback((productId: string) => ids.includes(productId), [ids])

  const value = useMemo(() => ({ ids, toggle, has }), [ids, toggle, has])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
