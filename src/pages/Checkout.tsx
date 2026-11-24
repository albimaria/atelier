import { Info } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useUI } from '../context/UIContext'
import { products } from '../data/products'
import { api, ApiError, connect, type Order } from '../services/api'
import { estimateTax, shippingCost } from '../services/pricing'
import { formatPrice } from '../utils/format'

const field =
  'w-full rounded-2xl border border-line/15 bg-paper/60 px-4 py-3.5 outline-none transition placeholder:text-mist focus:border-accent'

type Form = { firstName: string; lastName: string; email: string; address: string; city: string; postalCode: string }

/** Offline fallback: build the order in the browser with the same pricing rules as the API. */
function localOrder(items: ReturnType<typeof useCart>['items'], form: Form): Order {
  const lines = items.flatMap((i) => {
    const p = products.find((x) => x.id === i.productId)
    return p ? [{ productId: p.id, name: p.name, image: p.images[0], price: p.price, size: i.size, color: i.color, quantity: i.quantity }] : []
  })
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  const shipping = shippingCost(subtotal)
  const tax = estimateTax(subtotal)
  const order: Order = {
    number: `ATL-LOCAL-${Date.now().toString(36).toUpperCase()}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    contact: { name: `${form.firstName} ${form.lastName}`, email: form.email },
    shipping: { address: form.address, city: form.city, postalCode: form.postalCode },
    totals: { subtotal, shipping, tax, total: subtotal + shipping + tax },
    items: lines,
  }
  const saved = JSON.parse(localStorage.getItem('atelier-local-orders') ?? '[]') as Order[]
  localStorage.setItem('atelier-local-orders', JSON.stringify([order, ...saved]))
  return order
}

export function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const { notify } = useUI()
  const [placed, setPlaced] = useState<Order | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Form>(() => {
    const [firstName = '', ...rest] = (user?.name ?? '').split(' ')
    return { firstName, lastName: rest.join(' '), email: user?.email ?? '', address: '', city: '', postalCode: '' }
  })

  const sub = subtotal(products)
  const shipping = shippingCost(sub)
  const tax = estimateTax(sub)
  const total = sub + shipping + tax

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      let order: Order
      if (await connect()) {
        const res = await api.placeOrder({
          items,
          contact: { name: `${form.firstName} ${form.lastName}`.trim(), email: form.email },
          shipping: { address: form.address, city: form.city, postalCode: form.postalCode },
        })
        order = res.order
      } else {
        order = localOrder(items, form)
      }
      clear()
      setPlaced(order)
      notify('Order placed')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? [err.message, ...(err.details ?? []).map((d) => `${d.path}: ${d.message}`)].join(' ')
          : 'Could not place the order. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center md:py-24">
        <p className="eyebrow justify-center">Confirmed</p>
        <h1 className="editorial-title mt-4 text-5xl md:text-6xl">Thank you.</h1>
        <p className="mt-4 text-mist">
          Order <span className="font-medium text-ink">{placed.number}</span> is confirmed.
        </p>
        <div className="glass mx-auto mt-8 max-w-sm space-y-2 rounded-3xl p-6 text-left text-sm">
          <div className="flex justify-between"><span className="text-mist">Subtotal</span><span>{formatPrice(placed.totals.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-mist">Shipping</span><span>{placed.totals.shipping ? formatPrice(placed.totals.shipping) : 'Complimentary'}</span></div>
          <div className="flex justify-between"><span className="text-mist">Tax</span><span>{formatPrice(placed.totals.tax)}</span></div>
          <div className="flex justify-between border-t border-line/10 pt-2 font-medium"><span>Total</span><span>{formatPrice(placed.totals.total)}</span></div>
        </div>
        <p className="mx-auto mt-6 max-w-sm text-xs text-mist">
          This is a portfolio demo: no payment was taken and nothing will be shipped.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button to="/shop">Continue browsing</Button>
          {user && (
            <Button to="/profile" variant="outline">
              View my orders
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <EmptyState title="Your bag is waiting." text="Add a piece before checking out." actionLabel="Shop collection" to="/shop" />
    )
  }

  const input = (key: keyof Form, props: { placeholder: string; type?: string; autoComplete?: string; className?: string }) => (
    <input
      required
      value={form[key]}
      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      aria-label={props.placeholder}
      placeholder={props.placeholder}
      type={props.type ?? 'text'}
      autoComplete={props.autoComplete}
      className={`${field} ${props.className ?? ''}`}
    />
  )

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1fr_360px]">
      <form className="space-y-8" onSubmit={onSubmit}>
        <h1 className="editorial-title text-5xl md:text-6xl">Checkout</h1>
        {!user && (
          <p className="text-sm text-mist">
            <Link to="/login" className="text-ink underline underline-offset-4">Sign in</Link> to save this order to your account.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {input('firstName', { placeholder: 'First name', autoComplete: 'given-name' })}
          {input('lastName', { placeholder: 'Last name', autoComplete: 'family-name' })}
          {input('email', { placeholder: 'Email', type: 'email', autoComplete: 'email', className: 'md:col-span-2' })}
          {input('address', { placeholder: 'Address', autoComplete: 'street-address', className: 'md:col-span-2' })}
          {input('city', { placeholder: 'City', autoComplete: 'address-level2' })}
          {input('postalCode', { placeholder: 'Postal code', autoComplete: 'postal-code' })}
        </div>

        <div className="flex gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm">
          <Info size={18} className="mt-0.5 shrink-0 text-accent" />
          <p>
            <span className="font-medium">Demo checkout, no payment step.</span>{' '}
            <span className="text-mist">This store is a portfolio project. Orders are saved so you can see the full flow, but nothing is charged or shipped.</span>
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-2xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full md:w-auto" disabled={busy}>
          {busy ? 'Placing order…' : `Place demo order · ${formatPrice(total)}`}
        </Button>
      </form>

      <aside className="glass h-fit rounded-3xl p-6">
        <h2 className="text-[11px] tracking-[0.22em] uppercase">Summary</h2>
        <ul className="mt-6 space-y-4">
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (!product) return null
            return (
              <li key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center gap-3 text-sm">
                <img src={product.images[0]} alt="" className="h-14 w-11 rounded-lg object-cover" />
                <span className="flex-1">
                  {product.name}
                  <span className="block text-xs text-mist">
                    {item.color} · {item.size} · ×{item.quantity}
                  </span>
                </span>
                <span>{formatPrice(product.price * item.quantity)}</span>
              </li>
            )
          })}
        </ul>
        <div className="mt-6 space-y-2 border-t border-line/10 pt-4 text-sm">
          <div className="flex justify-between"><span className="text-mist">Shipping</span><span>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span></div>
          <div className="flex justify-between"><span className="text-mist">Tax</span><span>{formatPrice(tax)}</span></div>
          <div className="flex justify-between pt-2 font-medium"><span>Total</span><span>{formatPrice(total)}</span></div>
        </div>
        <Link to="/cart" className="mt-6 block text-[11px] tracking-[0.16em] uppercase text-mist hover:text-ink">
          Edit bag
        </Link>
      </aside>
    </div>
  )
}
