import { useState } from 'react'
import type { Product } from '../../types'
import { TiltCard } from '../fx/TiltCard'

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0)

  return (
    <div className="grid gap-3 md:grid-cols-[88px_1fr]">
      <div className="order-2 flex gap-2 md:order-1 md:flex-col">
        {product.images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            className={`aspect-square w-20 overflow-hidden rounded-2xl border-2 transition ${
              i === active ? 'border-gold scale-105' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <TiltCard max={7} className="order-1 rounded-[32px] md:order-2">
        <div className="glow-border overflow-hidden rounded-[32px] bg-sand shadow-[0_50px_100px_-40px_rgb(123_97_255/0.45)]">
          <img
            key={active}
            src={product.images[active]}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover animate-fade-in"
          />
        </div>
      </TiltCard>
    </div>
  )
}
