import { Heart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { ColorSelector } from '../components/common/ColorSelector'
import { QuantitySelector } from '../components/common/QuantitySelector'
import { RatingStars } from '../components/common/RatingStars'
import { SizeSelector } from '../components/common/SizeSelector'
import { ProductGallery } from '../components/product/ProductGallery'
import { ProductCard } from '../components/product/ProductCard'
import { useCart } from '../context/CartContext'
import { useUI } from '../context/UIContext'
import { useWishlist } from '../context/WishlistContext'
import { getProduct, getRelated } from '../data/products'
import { formatPrice } from '../utils/format'

export function ProductDetails() {
  const { id } = useParams()
  const product = getProduct(id ?? '')
  const related = product ? getRelated(product) : []
  const { addItem } = useCart()
  const { toggle, has } = useWishlist()
  const { notify, setCartOpen } = useUI()

  const [color, setColor] = useState(product?.colors[0].name ?? '')
  const [size, setSize] = useState(product?.sizes[0] ?? '')
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'details' | 'materials' | 'shipping' | 'returns' | 'reviews'>('details')

  const wished = product ? has(product.id) : false

  const tabs = useMemo(
    () =>
      product
        ? [
            { id: 'details' as const, label: 'Details', body: product.details },
            { id: 'materials' as const, label: 'Materials', body: product.materials },
            { id: 'shipping' as const, label: 'Shipping', body: 'Complimentary shipping on orders over $250. Standard 3–6 business days. Express available at checkout.' },
            { id: 'returns' as const, label: 'Returns', body: 'Free returns within 14 days. Pieces must be unworn with original packaging.' },
            { id: 'reviews' as const, label: 'Reviews', body: '' },
          ]
        : [],
    [product],
  )

  if (!product) {
    return (
      <div className="px-5 py-24 text-center">
        <h1 className="editorial-title text-5xl">Piece not found</h1>
        <Link to="/shop" className="mt-6 inline-block text-[11px] tracking-[0.2em] uppercase">
          Back to shop
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
      <p className="text-[11px] tracking-[0.2em] uppercase text-mist">
        <Link to="/shop">Shop</Link> / {product.category}
      </p>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <ProductGallery product={product} />
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-mist">{product.category}</p>
          <h1 className="editorial-title mt-3 text-5xl md:text-6xl">{product.name}</h1>
          <div className="mt-4">
            <RatingStars rating={product.rating} reviews={product.reviews.length} />
          </div>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-xl">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-mist line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <p className="mt-6 max-w-md leading-relaxed text-mist">{product.description}</p>

          <div className="mt-8">
            <p className="mb-3 text-[11px] tracking-[0.18em] uppercase">Color — {color}</p>
            <ColorSelector colors={product.colors} value={color} onChange={setColor} />
          </div>
          <div className="mt-8">
            <p className="mb-3 text-[11px] tracking-[0.18em] uppercase">Size</p>
            <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />
          </div>
          <div className="mt-8">
            <p className="mb-3 text-[11px] tracking-[0.18em] uppercase">Quantity</p>
            <QuantitySelector value={qty} onChange={setQty} />
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => {
                addItem(product, { size, color, quantity: qty })
                notify('Added to bag')
                setCartOpen(true)
              }}
            >
              Add to bag
            </Button>
            <button
              type="button"
              onClick={() => {
                const added = toggle(product.id)
                notify(added ? 'Saved to wishlist' : 'Removed from wishlist')
              }}
              className="inline-flex items-center justify-center gap-2 border border-ink px-6 py-3.5 text-[11px] tracking-[0.18em] uppercase"
            >
              <Heart size={16} className={wished ? 'fill-ink' : ''} />
              Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-sand pt-10">
        <div className="flex flex-wrap gap-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`text-[11px] tracking-[0.2em] uppercase ${
                tab === t.id ? 'text-ink border-b border-ink pb-1' : 'text-mist'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-8 max-w-2xl text-mist leading-relaxed">
          {tab === 'reviews' ? (
            <ul className="space-y-6">
              {product.reviews.map((review) => (
                <li key={review.id}>
                  <p className="text-ink">
                    {review.author} · {review.rating}/5
                  </p>
                  <p className="mt-1">{review.text}</p>
                  <p className="mt-1 text-xs">{review.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>{tabs.find((t) => t.id === tab)?.body}</p>
          )}
        </div>
      </div>

      <div className="mt-20">
        <h2 className="editorial-title text-4xl md:text-5xl">You may also like</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  )
}
