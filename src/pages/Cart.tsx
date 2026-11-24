import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { QuantitySelector } from '../components/common/QuantitySelector'
import { useCart } from '../context/CartContext'
import { products } from '../data/products'
import { estimateTax, shippingCost } from '../services/pricing'
import { formatPrice } from '../utils/format'

export function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()
  const sub = subtotal(products)
  const shipping = shippingCost(sub)
  const tax = estimateTax(sub)
  const total = sub + shipping + tax

  if (!items.length) {
    return (
      <EmptyState
        title="Your bag is waiting."
        text="When you find a piece, it will live here."
        actionLabel="Shop collection"
        to="/shop"
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <h1 className="editorial-title text-5xl md:text-7xl">Bag</h1>
      <div className="mt-12 grid gap-16 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-sand">
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (!product) return null
            return (
              <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-5 py-8">
                <Link to={`/product/${product.id}`}>
                  <img src={product.images[0]} alt="" className="h-36 w-28 object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link to={`/product/${product.id}`} className="font-serif text-2xl">
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-mist">
                        {item.color} · {item.size}
                      </p>
                    </div>
                    <p>{formatPrice(product.price * item.quantity)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(qty) => updateQuantity(item.productId, item.size, item.color, qty)}
                    />
                    <button
                      type="button"
                      className="text-[11px] tracking-[0.16em] uppercase text-mist hover:text-ink"
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <aside className="h-fit border border-sand p-6">
          <h2 className="text-[11px] tracking-[0.22em] uppercase">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(sub)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Estimated tax</dt>
              <dd>{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-sand pt-4 text-base">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <Button to="/checkout" className="mt-8 w-full">
            Proceed to checkout
          </Button>
        </aside>
      </div>
    </div>
  )
}
