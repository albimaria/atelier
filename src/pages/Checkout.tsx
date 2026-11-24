import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { useCart } from '../context/CartContext'
import { useUI } from '../context/UIContext'
import { products } from '../data/products'
import { estimateTax, shippingCost } from '../services/pricing'
import { formatPrice } from '../utils/format'

export function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { notify } = useUI()
  const navigate = useNavigate()
  const [placed, setPlaced] = useState(false)
  const sub = subtotal(products)
  const shipping = shippingCost(sub)
  const tax = estimateTax(sub)
  const total = sub + shipping + tax

  if (!items.length && !placed) {
    return (
      <EmptyState
        title="Your bag is waiting."
        text="Add a piece before checking out."
        actionLabel="Shop collection"
        to="/shop"
      />
    )
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <p className="text-[11px] tracking-[0.28em] uppercase text-mist">Confirmed</p>
        <h1 className="editorial-title mt-4 text-5xl">Thank you.</h1>
        <p className="mt-4 text-mist">
          Your order has been placed. A confirmation will arrive shortly.
        </p>
        <div className="mt-10">
          <Button to="/shop">Continue browsing</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1fr_340px]">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault()
          clear()
          setPlaced(true)
          notify('Order placed')
          window.setTimeout(() => navigate('/'), 1800)
        }}
      >
        <h1 className="editorial-title text-5xl md:text-6xl">Checkout</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <input required placeholder="First name" className="border-b border-ink bg-transparent py-3 outline-none" />
          <input required placeholder="Last name" className="border-b border-ink bg-transparent py-3 outline-none" />
          <input required type="email" placeholder="Email" className="border-b border-ink bg-transparent py-3 outline-none md:col-span-2" />
          <input required placeholder="Address" className="border-b border-ink bg-transparent py-3 outline-none md:col-span-2" />
          <input required placeholder="City" className="border-b border-ink bg-transparent py-3 outline-none" />
          <input required placeholder="Postal code" className="border-b border-ink bg-transparent py-3 outline-none" />
          <input required placeholder="Card number" className="border-b border-ink bg-transparent py-3 outline-none md:col-span-2" />
        </div>
        <Button type="submit" className="w-full md:w-auto">
          Place order · {formatPrice(total)}
        </Button>
        <p className="text-xs text-mist">Demo checkout — no payment is processed.</p>
      </form>
      <aside className="h-fit border border-sand p-6">
        <h2 className="text-[11px] tracking-[0.22em] uppercase">Summary</h2>
        <ul className="mt-6 space-y-4">
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (!product) return null
            return (
              <li key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                <span>
                  {product.name} × {item.quantity}
                </span>
                <span>{formatPrice(product.price * item.quantity)}</span>
              </li>
            )
          })}
        </ul>
        <div className="mt-6 space-y-2 border-t border-sand pt-4 text-sm">
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <Link to="/cart" className="mt-6 block text-[11px] tracking-[0.16em] uppercase text-mist">
          Edit bag
        </Link>
      </aside>
    </div>
  )
}
