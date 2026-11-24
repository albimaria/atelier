import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useUI } from '../../context/UIContext'
import { products } from '../../data/products'
import { useLockBody } from '../../hooks/useLockBody'
import { formatPrice } from '../../utils/format'
import { QuantitySelector } from '../common/QuantitySelector'
import { Button } from '../common/Button'

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI()
  const { items, updateQuantity, removeItem, subtotal } = useCart()
  useLockBody(cartOpen)

  if (!cartOpen) return null

  const total = subtotal(products)

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close bag"
        className="absolute inset-0 bg-void/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setCartOpen(false)}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col glass-strong border-y-0 border-r-0 animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-sand px-6 py-5">
          <h2 className="text-[12px] tracking-[0.24em] uppercase">Your bag</h2>
          <button type="button" aria-label="Close" onClick={() => setCartOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-serif text-3xl">Your bag is waiting.</p>
              <p className="mt-2 text-sm text-mist">Add a piece to begin.</p>
              <div className="mt-8">
                <Button
                  to="/shop"
                  onClick={() => setCartOpen(false)}
                >
                  Shop collection
                </Button>
              </div>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => {
                const product = products.find((p) => p.id === item.productId)
                if (!product) return null
                return (
                  <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4">
                    <Link to={`/product/${product.id}`} onClick={() => setCartOpen(false)}>
                      <img src={product.images[0]} alt="" className="h-28 w-20 object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-serif text-lg leading-tight">{product.name}</p>
                          <p className="mt-1 text-xs text-mist">
                            {item.color} · {item.size}
                          </p>
                        </div>
                        <p className="text-sm">{formatPrice(product.price * item.quantity)}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(qty) => updateQuantity(item.productId, item.size, item.color, qty)}
                        />
                        <button
                          type="button"
                          className="text-[10px] tracking-[0.16em] uppercase text-mist hover:text-ink"
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
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-sand px-6 py-5">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button to="/checkout" className="mt-4 w-full" onClick={() => setCartOpen(false)}>
              Proceed to checkout
            </Button>
            <Link
              to="/cart"
              onClick={() => setCartOpen(false)}
              className="mt-3 block text-center text-[11px] tracking-[0.18em] uppercase text-mist hover:text-ink"
            >
              View bag
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
