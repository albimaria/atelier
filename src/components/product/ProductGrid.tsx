import type { Product } from '../../types'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <p className="py-20 text-center text-mist">No pieces match those filters. Try widening your search.</p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
