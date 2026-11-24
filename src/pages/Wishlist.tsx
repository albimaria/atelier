import { EmptyState } from '../components/common/EmptyState'
import { ProductGrid } from '../components/product/ProductGrid'
import { useWishlist } from '../context/WishlistContext'
import { products } from '../data/products'

export function Wishlist() {
  const { ids } = useWishlist()
  const items = products.filter((p) => ids.includes(p.id))

  if (!items.length) {
    return (
      <EmptyState
        title="Nothing saved yet."
        text="Tap the heart on a piece you want to return to."
        actionLabel="Browse the collection"
        to="/shop"
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <p className="text-[11px] tracking-[0.28em] uppercase text-mist">Saved</p>
      <h1 className="editorial-title mt-2 text-5xl md:text-7xl">Wishlist</h1>
      <p className="mt-4 text-mist">{items.length} piece{items.length === 1 ? '' : 's'}</p>
      <div className="mt-12">
        <ProductGrid products={items} />
      </div>
    </div>
  )
}
