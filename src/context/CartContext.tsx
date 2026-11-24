import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'

const STORAGE_KEY = 'atelier-cart'

type CartContextValue = {
  items: CartItem[]
  addItem: (product: Product, options?: { size?: string; color?: string; quantity?: number }) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clear: () => void
  /** Replace the whole cart (used when syncing with the signed-in account). */
  replaceItems: (items: CartItem[]) => void
  count: number
  subtotal: (catalog: Product[]) => number
}

const CartContext = createContext<CartContextValue | null>(null)

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setItems(readCart())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, ready])

  const addItem = useCallback((product: Product, options?: { size?: string; color?: string; quantity?: number }) => {
    const size = options?.size ?? product.sizes[0]
    const color = options?.color ?? product.colors[0].name
    const quantity = options?.quantity ?? 1

    setItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.size === size && item.color === color,
      )
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: Math.min(10, item.quantity + quantity) } : item,
        )
      }
      return [...prev, { productId: product.id, size, color, quantity }]
    })
  }, [])

  const removeItem = useCallback((productId: string, size: string, color: string) => {
    setItems((prev) => prev.filter((item) => !(item.productId === productId && item.size === size && item.color === color)))
  }, [])

  const updateQuantity = useCallback((productId: string, size: string, color: string, quantity: number) => {
    setItems((prev) => {
      if (quantity < 1) {
        return prev.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
      }
      return prev.map((item) =>
        item.productId === productId && item.size === size && item.color === color ? { ...item, quantity: Math.min(10, quantity) } : item,
      )
    })
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const replaceItems = useCallback((next: CartItem[]) => setItems(next), [])

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const subtotal = useCallback(
    (catalog: Product[]) =>
      items.reduce((sum, item) => {
        const product = catalog.find((p) => p.id === item.productId)
        return sum + (product ? product.price * item.quantity : 0)
      }, 0),
    [items],
  )

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clear, replaceItems, count, subtotal }),
    [items, addItem, removeItem, updateQuantity, clear, replaceItems, count, subtotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
