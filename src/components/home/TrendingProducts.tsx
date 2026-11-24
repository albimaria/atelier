import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import type { Product } from '../../types'
import { formatPrice } from '../../utils/format'
import { Marquee } from '../fx/Marquee'
import { SectionHeading } from './SectionHeading'

function WallCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group mx-3 block w-[220px] shrink-0 overflow-hidden rounded-[22px] bg-sand ring-1 ring-line/10 transition duration-500 hover:-translate-y-3 hover:ring-gold/60 hover:shadow-[0_30px_60px_-20px_rgb(123_97_255/0.6)] md:w-[260px]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <span className="glass-dark absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] tracking-[0.22em] uppercase text-pearl">
          Trending
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 p-4">
        <p className="truncate font-serif text-lg">{product.name}</p>
        <p className="shrink-0 text-sm text-accent">{formatPrice(product.price)}</p>
      </div>
    </Link>
  )
}

/** An infinite product wall laid on a tilted plane in 3D space. */
export function TrendingProducts() {
  const items = products.filter((p) => p.isTrending)
  const rowA = items.filter((_, i) => i % 2 === 0)
  const rowB = items.filter((_, i) => i % 2 === 1)
  const fill = (row: Product[]) => (row.length < 5 ? [...row, ...row, ...row] : row)

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          index="06"
          eyebrow="Right now"
          title={
            <>
              Trending <em className="text-chrome">wall</em>
            </>
          }
          aside={<p className="hidden max-w-xs text-sm text-mist md:block">Hover to pause the wall. Click any piece to see it up close.</p>}
        />
      </div>

      <div className="relative" style={{ perspective: '1400px' }}>
        <div
          className="preserve-3d -mx-[10%] flex flex-col gap-6 py-10"
          style={{ transform: 'rotateX(22deg) rotateZ(-5deg) rotateY(-6deg)' }}
        >
          <Marquee duration={55} pauseOnHover className="fade-x py-4">
            {fill(rowA).map((p, i) => (
              <WallCard key={`${p.id}-${i}`} product={p} />
            ))}
          </Marquee>
          <Marquee duration={65} reverse pauseOnHover className="fade-x py-4">
            {fill(rowB.length ? rowB : rowA).map((p, i) => (
              <WallCard key={`${p.id}-${i}`} product={p} />
            ))}
          </Marquee>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ivory to-transparent" />
      </div>
    </section>
  )
}
