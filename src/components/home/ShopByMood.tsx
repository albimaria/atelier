import { useState } from 'react'
import { Link } from 'react-router-dom'
import { img } from '../../utils/format'
import { Reveal } from '../common/Reveal'
import { SectionHeading } from './SectionHeading'

const moods = [
  { name: 'Minimal', copy: 'Reduced forms', image: img('photo-1490481651871-ab68de25d43d', 800) },
  { name: 'After Dark', copy: 'Evening restraint', image: img('photo-1469334031218-e382a71b716b', 800) },
  { name: 'Weekend', copy: 'Unhurried ease', image: img('photo-1529139574466-a303027c1d8b', 800) },
  { name: 'Statement', copy: 'Holds the room', image: img('photo-1483985988355-763728e1935b', 800) },
  { name: 'Everyday', copy: 'Daily rotation', image: img('photo-1487222477894-8943e31ef7b2', 800) },
]

/** A hand of cards fanned in 3D; hovering one lifts it out of the fan. */
export function ShopByMood() {
  const [hovered, setHovered] = useState<number | null>(null)
  const mid = (moods.length - 1) / 2

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          index="05"
          eyebrow="Atmosphere"
          align="center"
          title={
            <>
              Shop by <em className="text-chrome">mood</em>
            </>
          }
        />
      </div>

      <Reveal>
        <div
          className="relative mx-auto h-[380px] max-w-6xl sm:h-[460px] md:h-[540px]"
          style={{ perspective: '1600px' }}
          onPointerLeave={() => setHovered(null)}
        >
          <div className="preserve-3d absolute inset-0" style={{ transform: 'rotateX(12deg)' }}>
            {moods.map((mood, i) => {
              const o = i - mid
              const isHovered = hovered === i
              const spread = hovered === null ? 1 : 1.12
              const push = hovered === null ? 0 : i < hovered ? -24 : i > hovered ? 24 : 0
              const transform = isHovered
                ? `translateX(calc(-50% + ${o * 46 * spread}%)) translateY(-40px) translateZ(160px) rotateZ(0deg)`
                : `translateX(calc(-50% + ${o * 46 * spread}% + ${push}px)) translateY(${Math.abs(o) * 26}px) translateZ(${-Math.abs(o) * 60}px) rotateZ(${o * 7}deg) rotateY(${o * -10}deg)`

              return (
                <Link
                  key={mood.name}
                  to={`/shop?mood=${encodeURIComponent(mood.name)}`}
                  onPointerEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  className="group absolute left-1/2 top-6 block aspect-[3/4] w-[44vw] max-w-[300px] origin-bottom overflow-hidden rounded-[26px] bg-sand ring-1 ring-line/10 sm:w-[30vw]"
                  style={{
                    transform,
                    zIndex: isHovered ? 50 : 20 - Math.abs(Math.round(o)),
                    transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease',
                    boxShadow: isHovered
                      ? '0 50px 100px -30px rgb(123 97 255 / 0.55), 0 0 0 1px rgb(227 197 143 / 0.5)'
                      : '0 30px 60px -25px rgb(0 0 0 / 0.95)',
                  }}
                >
                  <img
                    src={mood.image}
                    alt={mood.name}
                    loading="lazy"
                    className={`h-full w-full object-cover transition duration-700 ${
                      isHovered ? 'scale-105 grayscale-0' : 'grayscale'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-center">
                    <p className="font-serif text-3xl text-pearl md:text-4xl">{mood.name}</p>
                    <p
                      className={`mt-1 text-[10px] tracking-[0.24em] uppercase text-gold transition duration-500 ${
                        isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                      }`}
                    >
                      {mood.copy}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
