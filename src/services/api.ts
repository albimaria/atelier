import { useSyncExternalStore } from 'react'
import type { CartItem, Product } from '../types'

/**
 * Client for the Atelier API (see /server).
 *
 * The API is optional: when VITE_API_URL is unset, or the server can't be reached, the
 * storefront keeps working in local demo mode with the bundled catalogue and localStorage.
 */

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
export const API_DOCS_URL = API_URL ? `${API_URL}/api/docs` : ''

// ---------- Connection status ----------

export type ApiStatus = 'disabled' | 'connecting' | 'waking' | 'online' | 'offline'

let status: ApiStatus = API_URL ? 'connecting' : 'disabled'
let latencyMs: number | null = null
const listeners = new Set<() => void>()

function setStatus(next: ApiStatus) {
  status = next
  listeners.forEach((l) => l())
}

export function getApiStatus() {
  return status
}

export function useApiStatus() {
  const s = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => status,
  )
  return { status: s, latencyMs, online: s === 'online' }
}

/**
 * Ping /api/health. Free hosting tiers sleep when idle, so the first request can take
 * 30–60s; we show "waking" and keep retrying before giving up and going offline.
 */
let connecting: Promise<boolean> | null = null
export function connect(): Promise<boolean> {
  if (!API_URL) return Promise.resolve(false)
  if (connecting) return connecting
  connecting = (async () => {
    const deadline = Date.now() + 75_000
    let attempt = 0
    while (Date.now() < deadline) {
      const started = performance.now()
      try {
        const res = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(attempt === 0 ? 4000 : 15000) })
        if (res.ok) {
          latencyMs = Math.round(performance.now() - started)
          setStatus('online')
          return true
        }
      } catch {
        /* not up yet */
      }
      attempt++
      setStatus('waking')
      await new Promise((r) => setTimeout(r, Math.min(2000 * attempt, 6000)))
    }
    setStatus('offline')
    return false
  })().finally(() => {
    connecting = null
  })
  return connecting
}

// ---------- Requests ----------

export class ApiError extends Error {
  status: number
  code: string
  details?: { path: string; message: string }[]

  constructor(status: number, code: string, message: string, details?: { path: string; message: string }[]) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

const TOKEN_KEY = 'atelier-token'
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  if (!API_URL) throw new ApiError(0, 'API_DISABLED', 'The API is not configured.')
  const headers = new Headers(init.headers)
  const token = tokenStore.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.json !== undefined) headers.set('Content-Type', 'application/json')

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
      signal: init.signal ?? AbortSignal.timeout(20000),
    })
  } catch {
    setStatus('offline')
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server.')
  }
  if (status !== 'online') setStatus('online')

  const body = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    const e = body?.error ?? {}
    throw new ApiError(res.status, e.code ?? 'HTTP_ERROR', e.message ?? `Request failed (${res.status})`, e.details)
  }
  return body as T
}

// ---------- Endpoints ----------

export type User = { id: number; name: string; email: string; createdAt: string }
export type Session = { token: string; user: User }

export type OrderLine = { productId: string; name: string; image: string; price: number; size: string; color: string; quantity: number }
export type Order = {
  number: string
  status: string
  createdAt: string
  contact: { name: string; email: string }
  shipping: { address: string; city: string; postalCode: string }
  totals: { subtotal: number; shipping: number; tax: number; total: number }
  items: OrderLine[]
}

export type ProductQuery = Record<string, string | number | boolean | undefined>

export const api = {
  products(query: ProductQuery, signal?: AbortSignal) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== '' && v !== false) qs.set(k, String(v))
    return request<{ items: Product[]; total: number }>(`/api/products?${qs}`, { signal })
  },
  register: (body: { name: string; email: string; password: string }) =>
    request<Session>('/api/auth/register', { method: 'POST', json: body }),
  login: (body: { email: string; password: string }) => request<Session>('/api/auth/login', { method: 'POST', json: body }),
  demo: () => request<Session>('/api/auth/demo', { method: 'POST' }),
  me: () => request<{ user: User }>('/api/auth/me'),
  getCart: () => request<{ items: CartItem[] }>('/api/account/cart'),
  putCart: (items: CartItem[]) => request<{ items: CartItem[] }>('/api/account/cart', { method: 'PUT', json: { items } }),
  getWishlist: () => request<{ ids: string[] }>('/api/account/wishlist'),
  putWishlist: (ids: string[]) => request<{ ids: string[] }>('/api/account/wishlist', { method: 'PUT', json: { ids } }),
  placeOrder: (body: {
    items: CartItem[]
    contact: { name: string; email: string }
    shipping: { address: string; city: string; postalCode: string }
  }) => request<{ order: Order }>('/api/orders', { method: 'POST', json: body }),
  orders: () => request<{ items: Order[] }>('/api/orders'),
  subscribe: (email: string) => request<{ subscribed: boolean }>('/api/newsletter', { method: 'POST', json: { email } }),
}
