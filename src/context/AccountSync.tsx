import { useEffect, useRef } from 'react'
import { api } from '../services/api'
import type { CartItem } from '../types'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'
import { useWishlist } from './WishlistContext'

const key = (i: CartItem) => `${i.productId}|${i.size}|${i.color}`

/**
 * Keeps the cart and wishlist in sync with the signed-in API account.
 * On sign-in, server and local items are merged; afterwards local changes are saved (debounced).
 */
export function AccountSync() {
  const { user } = useAuth()
  const { items, replaceItems } = useCart()
  const { ids, replace } = useWishlist()
  const syncedFor = useRef<number | null>(null)
  const ready = useRef(false)
  const accountId = user && !user.local ? user.id ?? null : null

  // Merge once per sign-in.
  useEffect(() => {
    if (accountId === null) {
      syncedFor.current = null
      ready.current = false
      return
    }
    if (syncedFor.current === accountId) return
    syncedFor.current = accountId
    ready.current = false
    let cancelled = false

    Promise.all([api.getCart(), api.getWishlist()])
      .then(async ([cart, wish]) => {
        if (cancelled) return
        const serverKeys = new Set(cart.items.map(key))
        const mergedCart = [...cart.items, ...items.filter((i) => !serverKeys.has(key(i)))]
        const mergedIds = [...new Set([...wish.ids, ...ids])]
        replaceItems(mergedCart)
        replace(mergedIds)
        await Promise.all([api.putCart(mergedCart), api.putWishlist(mergedIds)])
        ready.current = true
      })
      .catch(() => {
        /* API hiccup: keep working locally; the next change will try again. */
        ready.current = true
      })
    return () => {
      cancelled = true
    }
    // Merge uses the local state at sign-in time only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId])

  // Save subsequent changes.
  useEffect(() => {
    if (accountId === null || !ready.current) return
    const t = window.setTimeout(() => {
      api.putCart(items).catch(() => {})
    }, 600)
    return () => window.clearTimeout(t)
  }, [items, accountId])

  useEffect(() => {
    if (accountId === null || !ready.current) return
    const t = window.setTimeout(() => {
      api.putWishlist(ids).catch(() => {})
    }, 600)
    return () => window.clearTimeout(t)
  }, [ids, accountId])

  return null
}
