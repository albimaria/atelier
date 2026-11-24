import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import { img } from '../../utils/format'
import { Coverflow } from '../fx/Coverflow'
import { SectionHeading } from './SectionHeading'

const categories = [
  { name: 'Shoes', image: img('photo-1549298916-b41d501d3772', 900) },
  { name: 'Dresses', image: img('photo-1595777457583-95e059d581b8', 900) },
  { name: 'Clothing', image: img('photo-1539533018447-63fcce2678e3', 900) },
  { name: 'Scents', image: img('photo-1541643600914-78b084683601', 900) },
  { name: 'Bags', image: img('photo-1584917865442-de89df76afd3', 900) },
  { name: 'Watches', image: img('photo-1523275335684-37898b6baf30', 900) },
  { name: 'Accessories', image: img('photo-1511499767150-a48a237f0083', 900) },
].map((c) => ({ ...c, count: products.filter((p) => p.category === c.name).length }))

export function CategorySection() {
  return (
    <section id="categories" className="relative overflow-hidden py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-violet/15 blur-[120px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          index="01"
          eyebrow="The edit"
          title={
            <>
              Shop by <em className="text-chrome">category</em>
            </>
          }
          aside={<p className="hidden max-w-xs text-sm text-mist md:block">Swipe, drag or use your arrow keys to flip through the edit.</p>}
        />
      </div>

      <Coverflow
        items={categories}
        autoplay={4200}
        getLabel={(c) => c.name}
        render={(cat, i, active) => (
          <Link
            to={`/shop?category=${cat.name}`}
            draggable={false}
            className="group glow-border relative block h-full w-full overflow-hidden rounded-[28px] bg-sand shadow-[0_40px_80px_-30px_rgb(0_0_0/0.95)]"
          >
            <img
              src={cat.image}
              alt={cat.name}
              draggable={false}
              className="h-full w-full object-cover transition duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />
            <span className="absolute left-5 top-5 font-serif text-sm text-pearl/70">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div
              className={`absolute inset-x-0 bottom-0 flex items-end justify-between p-6 transition duration-700 ${
                active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-60'
              }`}
            >
              <div>
                <p className="font-serif text-4xl text-pearl md:text-5xl">{cat.name}</p>
                <p className="mt-1 text-[11px] tracking-[0.22em] uppercase text-pearl/60">{cat.count} pieces</p>
              </div>
              <span className="glass-dark grid h-12 w-12 place-items-center rounded-full text-pearl transition duration-500 group-hover:rotate-45 group-hover:bg-pearl group-hover:text-void">
                <ArrowUpRight size={18} />
              </span>
            </div>
          </Link>
        )}
      />
    </section>
  )
}
