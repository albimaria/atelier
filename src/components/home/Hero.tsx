import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import { usePointerParallax } from '../../hooks/usePointerParallax'
import { formatPrice } from '../../utils/format'
import { Button } from '../common/Button'
import { Aurora } from '../fx/Aurora'
import { RingCarousel } from '../fx/RingCarousel'

const ringItems = products.slice(0, 12)

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  usePointerParallax(ref)

  return (
    <section
      ref={ref}
      className="relative -mt-20 flex min-h-[min(100svh,1000px)] flex-col overflow-hidden bg-ivory pt-24 md:-mt-24"
      style={{ perspective: '1200px' }}
    >
      <Aurora />

      {/* Perspective floor */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]" style={{ perspective: '600px' }}>
        <div
          className="perspective-grid absolute -left-1/2 bottom-0 h-[160%] w-[200%] origin-bottom"
          style={{ transform: 'rotateX(72deg)' }}
        />
      </div>

      {/* Horizon glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[52%] h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent shadow-[0_0_40px_8px_rgb(227_197_143/0.25)]"
      />

      {/* Giant outlined wordmark behind the ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[16%] select-none text-center font-serif text-[26vw] leading-none tracking-[-0.04em] text-outline md:top-[10%] md:text-[22vw]"
        style={{ transform: 'translate3d(calc(var(--px, 0) * -24px), calc(var(--py, 0) * -14px), 0)' }}
      >
        ATELIER
      </div>

      {/* 3D ring */}
      <div
        className="relative z-10 mt-6 flex flex-1 items-center md:mt-0"
        style={{
          transform: 'rotateX(calc(var(--py, 0) * -6deg)) rotateY(calc(var(--px, 0) * 8deg))',
          transformStyle: 'preserve-3d',
        }}
      >
        <RingCarousel
          items={ringItems}
          speed={9}
          widthRatio={0.15}
          minWidth={120}
          maxWidth={230}
          render={(p) => (
            <Link
              to={`/product/${p.id}`}
              draggable={false}
              className="group glow-border block h-full w-full overflow-hidden rounded-[22px] bg-sand shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)]"
            >
              <img
                src={p.images[0]}
                alt={p.name}
                draggable={false}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/90 to-transparent p-3 pt-10">
                <p className="truncate font-serif text-lg leading-tight text-pearl">{p.name}</p>
                <p className="text-[11px] tracking-[0.18em] text-pearl/60">{formatPrice(p.price)}</p>
              </div>
            </Link>
          )}
        />
      </div>

      {/* Copy */}
      <div className="relative z-20 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-10 md:grid-cols-[1.4fr_1fr] md:items-end md:px-8 md:pb-14">
        <div>
          <p className="eyebrow animate-fade-up">Autumn collection — 2026</p>
          <h1
            className="editorial-title mt-4 text-[13vw] text-ink sm:text-7xl md:text-8xl animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            Define your <em className="text-chrome not-italic md:italic">everyday.</em>
          </h1>
        </div>
        <div className="animate-fade-up md:pb-3" style={{ animationDelay: '200ms' }}>
          <p className="max-w-sm text-base text-ink/70 md:text-lg">
            Curated essentials for those who move differently. Drag the ring to explore the season.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button to="/shop">Shop collection</Button>
            <Button to="/shop?new=1" variant="outline">
              New arrivals
            </Button>
          </div>
        </div>
      </div>

      <a
        href="#categories"
        aria-label="Scroll to categories"
        className="absolute bottom-6 right-6 z-20 hidden h-14 w-9 items-start justify-center rounded-full border border-ink/25 pt-2 md:flex"
      >
        <span className="scroll-dot block h-2 w-1 rounded-full bg-gold" />
      </a>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ivory to-transparent" />
    </section>
  )
}
