import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TiltCard } from '../components/fx/TiltCard'
import { img } from '../utils/format'

const collections = [
  {
    name: 'Minimal',
    copy: 'Reduced forms. Quiet luxury.',
    image: img('photo-1490481651871-ab68de25d43d', 1200),
  },
  {
    name: 'After Dark',
    copy: 'Evening pieces with restraint.',
    image: img('photo-1469334031218-e382a71b716b', 1200),
  },
  {
    name: 'Weekend',
    copy: 'Ease without looking unfinished.',
    image: img('photo-1529139574466-a303027c1d8b', 1200),
  },
  {
    name: 'Statement',
    copy: 'One piece that holds the room.',
    image: img('photo-1483985988355-763728e1935b', 1200),
  },
  {
    name: 'Everyday',
    copy: 'The rotation you actually live in.',
    image: img('photo-1487222477894-8943e31ef7b2', 1200),
  },
]

export function Collections() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <p className="eyebrow">Worlds</p>
      <h1 className="editorial-title mt-4 text-6xl md:text-8xl">
        <em className="text-chrome">Collections</em>
      </h1>
      <div className="mt-12 space-y-8" style={{ perspective: '1600px' }}>
        {collections.map((c, i) => (
          <TiltCard key={c.name} max={4} className="rounded-[32px]">
            <Link
              to={`/shop?mood=${encodeURIComponent(c.name)}`}
              className="group glow-border relative block overflow-hidden rounded-[32px] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-[46vh] w-full object-cover transition duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-void/85 via-void/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-pearl md:p-12">
                <span className="font-serif text-sm text-gold">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="editorial-title mt-2 text-5xl md:text-7xl">{c.name}</h2>
                <p className="mt-3 max-w-md text-pearl/75">{c.copy}</p>
              </div>
              <span className="glass-dark absolute right-8 top-8 grid h-14 w-14 place-items-center rounded-full text-pearl transition duration-500 group-hover:rotate-45 group-hover:bg-pearl group-hover:text-void">
                <ArrowUpRight size={20} />
              </span>
            </Link>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}
