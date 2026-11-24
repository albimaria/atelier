import { Heart, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useUI } from '../../context/UIContext'
import { useWishlist } from '../../context/WishlistContext'
import type { Product } from '../../types'
import { formatPrice } from '../../utils/format'
import { RatingStars } from '../common/RatingStars'
import { TiltCard } from '../fx/TiltCard'

export function ProductCard({ product, badge }: { product: Product; badge?: string }) {
  const { addItem } = useCart()
  const { toggle, has } = useWishlist()
  const { notify, setCartOpen } = useUI()
  const wished = has(product.id)
  const label = badge ?? (product.isNew ? 'New' : product.isTrending ? 'Trending' : product.isSale ? 'Sale' : undefined)

  return (
    <article className="group relative">
      <TiltCard max={9} className="rounded-[24px]">
        <div className="relative overflow-hidden rounded-[24px] bg-sand shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] ring-1 ring-line/5 transition-shadow duration-500 group-hover:shadow-[0_40px_80px_-30px_rgb(123_97_255/0.45)]">
          <Link to={`/product/${product.id}`} className="block">
            <div className="relative aspect-[3/4]">
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-0"
              />
              <img
                src={product.images[1] ?? product.images[0]}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
            </div>
          </Link>

          {label && (
            <span
              className="glass-dark pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] tracking-[0.22em] uppercase text-pearl"
              style={{ transform: 'translateZ(40px)' }}
            >
              {label}
            </span>
          )}

          <button
            type="button"
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => {
              const added = toggle(product.id)
              notify(added ? 'Saved to wishlist' : 'Removed from wishlist')
            }}
            className="glass-dark absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full text-pearl transition hover:scale-110"
          >
            <Heart size={16} className={wished ? 'fill-rose text-rose' : ''} />
          </button>

          <button
            type="button"
            onClick={() => {
              addItem(product)
              notify('Added to bag')
              setCartOpen(true)
            }}
            className="glass-dark absolute inset-x-4 bottom-4 z-30 flex items-center justify-center gap-2 rounded-full py-3 text-[10px] tracking-[0.2em] uppercase text-pearl transition duration-500 hover:bg-pearl hover:text-void md:translate-y-[140%] md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            <Plus size={14} />
            Add to bag
          </button>
        </div>
      </TiltCard>

      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.2em] uppercase text-mist">{product.category}</p>
          <Link
            to={`/product/${product.id}`}
            className="mt-1 block truncate font-serif text-xl leading-tight transition-colors hover:text-accent"
          >
            {product.name}
          </Link>
          <div className="mt-2">
            <RatingStars rating={product.rating} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          {product.originalPrice && (
            <p className="text-xs text-mist line-through">{formatPrice(product.originalPrice)}</p>
          )}
          <p className="text-sm text-accent">{formatPrice(product.price)}</p>
        </div>
      </div>
    </article>
  )
}
