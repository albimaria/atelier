import { useRef } from 'react'
import { usePointerParallax } from '../../hooks/usePointerParallax'
import { img } from '../../utils/format'
import { Button } from '../common/Button'
import { Reveal } from '../common/Reveal'

const layers = [
  { src: img('photo-1469334031218-e382a71b716b', 1000), cls: 'left-[8%] top-[6%] w-[58%] aspect-[3/4]', z: 0 },
  { src: img('photo-1490481651871-ab68de25d43d', 700), cls: 'right-[2%] top-[30%] w-[42%] aspect-[4/5]', z: 120 },
  { src: img('photo-1529139574466-a303027c1d8b', 600), cls: 'left-0 bottom-[4%] w-[34%] aspect-square', z: 200 },
]

const chips = [
  { label: 'Considered materials', cls: 'right-[6%] top-[8%]', z: 260 },
  { label: 'Made to last', cls: 'left-[38%] bottom-[10%]', z: 300 },
]

export function EditorialBanner() {
  const ref = useRef<HTMLElement>(null)
  usePointerParallax(ref, 0.06)

  return (
    <section ref={ref} className="relative mx-auto max-w-7xl overflow-hidden px-5 py-24 md:px-8 md:py-32">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">
            <span className="font-serif text-sm tracking-normal text-accent">04</span>
            The manifesto
          </p>
          <h2 className="editorial-title mt-4 text-6xl md:text-8xl">
            Less, <br />
            <em className="text-chrome">but better.</em>
          </h2>
          <p className="mt-8 max-w-sm text-lg leading-relaxed text-mist">
            Designed around pieces you'll keep reaching for — chosen for how they feel, how they last and how
            they move with you.
          </p>
          <div className="mt-10 grid max-w-sm grid-cols-3 gap-4 border-t border-line/10 pt-8">
            {[
              ['01', 'Curated'],
              ['02', 'Crafted'],
              ['03', 'Kept'],
            ].map(([n, label]) => (
              <div key={n}>
                <p className="font-serif text-3xl text-accent">{n}</p>
                <p className="mt-1 text-[11px] tracking-[0.2em] uppercase text-mist">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button to="/shop">Discover the collection</Button>
          </div>
        </Reveal>

        {/* Layered depth scene: each plane sits at a different Z and reacts to the pointer. */}
        <div className="relative aspect-square w-full" style={{ perspective: '1100px' }}>
          <div
            className="preserve-3d absolute inset-0"
            style={{
              transform: 'rotateY(calc(var(--px, 0) * 14deg - 8deg)) rotateX(calc(var(--py, 0) * -10deg + 4deg))',
            }}
          >
            {layers.map((l, i) => (
              <div
                key={i}
                className={`absolute overflow-hidden rounded-[26px] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.9)] ring-1 ring-line/10 ${l.cls}`}
                style={{ transform: `translateZ(${l.z}px)` }}
              >
                <img src={l.src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
            {chips.map((c) => (
              <span
                key={c.label}
                className={`glass glow-border absolute rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase text-ink ${c.cls}`}
                style={{ transform: `translateZ(${c.z}px)` }}
              >
                {c.label}
              </span>
            ))}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/40"
              style={{ transform: 'translateZ(60px) rotateX(70deg)' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
