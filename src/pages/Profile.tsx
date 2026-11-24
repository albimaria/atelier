import { Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { api, type Order } from '../services/api'
import { formatPrice } from '../utils/format'

const LOCAL_ORDERS = 'atelier-local-orders'

function readLocalOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS) ?? '[]') as Order[]
  } catch {
    return []
  }
}

const date = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export function Profile() {
  const { user, signOut } = useAuth()
  const { ids } = useWishlist()
  const navigate = useNavigate()
  const [remoteOrders, setRemoteOrders] = useState<Order[] | null>(null)
  const [failed, setFailed] = useState(false)
  const remote = !!user && !user.local
  const orders = remote ? remoteOrders : user ? readLocalOrders() : null

  useEffect(() => {
    if (!remote) return
    let cancelled = false
    api
      .orders()
      .then((r) => !cancelled && setRemoteOrders(r.items))
      .catch(() => {
        if (cancelled) return
        setFailed(true)
        setRemoteOrders([])
      })
    return () => {
      cancelled = true
    }
  }, [remote, user?.id])

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="editorial-title text-5xl">Your atelier</h1>
        <p className="mt-4 text-mist">Sign in to view saved pieces and order history.</p>
        <div className="mt-8">
          <Button to="/login">Sign in</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:px-8">
      <p className="eyebrow">Profile</p>
      <h1 className="editorial-title mt-4 text-5xl capitalize md:text-6xl">{user.name}</h1>
      <p className="mt-2 text-mist">
        {user.email}
        <span className="ml-3 rounded-full border border-line/15 px-2.5 py-0.5 text-[10px] tracking-[0.18em] uppercase">
          {remote ? 'Synced account' : 'Local session'}
        </span>
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Link to="/wishlist" className="glass rounded-3xl p-6 transition hover:-translate-y-0.5 hover:border-gold/50">
          <p className="text-[11px] tracking-[0.2em] uppercase text-mist">Wishlist</p>
          <p className="mt-3 font-serif text-4xl">{ids.length} saved</p>
        </Link>
        <div className="glass rounded-3xl p-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-mist">Orders</p>
          <p className="mt-3 font-serif text-4xl">{orders === null ? '…' : orders.length}</p>
        </div>
      </div>

      <h2 className="mt-16 font-serif text-3xl">Order history</h2>
      {failed && <p className="mt-4 text-sm text-mist">Could not load orders from the server right now.</p>}
      {orders && orders.length === 0 && !failed && (
        <p className="mt-4 text-mist">No orders yet. Your first order will appear here.</p>
      )}
      <ul className="mt-6 space-y-4">
        {orders?.map((o) => (
          <li key={o.number} className="rounded-3xl border border-line/10 bg-paper/50 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/15 text-accent">
                  <Package size={18} />
                </span>
                <div>
                  <p className="font-medium">{o.number}</p>
                  <p className="text-sm text-mist">{date(o.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-line/15 px-3 py-1 text-[10px] tracking-[0.18em] uppercase">
                  {o.status}
                </span>
                <span className="font-serif text-2xl">{formatPrice(o.totals.total)}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto hide-scrollbar">
              {o.items.map((it) => (
                <Link key={`${it.productId}-${it.size}-${it.color}`} to={`/product/${it.productId}`} className="shrink-0" title={it.name}>
                  <img src={it.image} alt={it.name} className="h-20 w-16 rounded-xl object-cover" loading="lazy" />
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-12 text-[11px] tracking-[0.18em] uppercase text-mist hover:text-ink"
        onClick={() => {
          signOut()
          navigate('/')
        }}
      >
        Sign out
      </button>
    </div>
  )
}
