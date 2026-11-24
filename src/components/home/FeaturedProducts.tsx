import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import { Reveal } from '../common/Reveal'
import { ProductCard } from '../product/ProductCard'
import { SectionHeading } from './SectionHeading'

export function FeaturedProducts() {
  const featured = products.slice(0, 8)

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <SectionHeading
        index="02"
        eyebrow="Signature"
        title={
          <>
            Featured <em className="text-chrome">pieces</em>
          </>
        }
        aside={
          <Link
            to="/shop"
            className="group glass hidden items-center gap-3 rounded-full px-5 py-3 text-[11px] tracking-[0.2em] uppercase transition hover:border-gold/60 md:inline-flex"
          >
            View all
            <ArrowRight size={14} className="transition group-hover:translate-x-1" />
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-4 md:gap-x-6" style={{ perspective: '1600px' }}>
        {featured.map((product, i) => (
          <Reveal key={product.id} delay={(i % 4) * 90} className={i % 2 === 1 ? 'md:translate-y-12' : ''}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
