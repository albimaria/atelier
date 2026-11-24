import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useUI } from '../../context/UIContext'
import { products } from '../../data/products'
import { formatPrice } from '../../utils/format'
import { Button } from '../common/Button'
import { RatingStars } from '../common/RatingStars'
import { Reveal } from '../common/Reveal'
import { Aurora } from '../fx/Aurora'
import { CardStack } from '../fx/CardStack'

export function NewArrivals() {
  const items = products.filter((p) => p.isNew).slice(0, 8)
  const [index, setIndex] = useState(0)
  const { addItem } = useCart()
  const { notify, setCartOpen } = useUI()
  const current = items[index]

  if (!current) return null

  return (
    <section className="relative overflow-hidden border-y border-line/10 bg-paper py-24 md:py-32">
      <Aurora intensity={0.45} />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <p className="eyebrow">
            <span className="font-serif text-sm tracking-normal text-accent">03</span>
            Just landed
          </p>
          <h2 className="editorial-title mt-4 text-6xl md:text-8xl">
            New <span className="text-outline">/</span> <em className="text-chrome">Now</em>
          </h2>

          {/* Details for the card on top of the deck */}
          <div key={current.id} className="mt-12 animate-fade-up">
            <p className="text-[11px] tracking-[0.22em] uppercase text-mist">
              {current.category} · {current.gender}
            </p>
            <Link to={`/product/${current.id}`} className="mt-2 block font-serif text-4xl transition hover:text-accent md:text-5xl">
              {current.name}
            </Link>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-xl text-accent">{formatPrice(current.price)}</span>
              <RatingStars rating={current.rating} />
            </div>
            <p className="mt-5 max-w-md leading-relaxed text-mist">{current.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  addItem(current)
                  notify('Added to bag')
                  setCartOpen(true)
                }}
              >
                <Plus size={14} /> Add to bag
              </Button>
              <Button to="/shop?new=1" variant="outline">
                See all new
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <CardStack
            items={items}
            index={index}
            onIndexChange={setIndex}
            render={(p) => (
              <Link
                to={`/product/${p.id}`}
                draggable={false}
                className="glow-border relative block h-full w-full overflow-hidden rounded-[30px] bg-sand shadow-[0_50px_100px_-30px_rgb(0_0_0/0.95)]"
              >
                <img src={p.images[0]} alt={p.name} draggable={false} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-void/20" />
                <span className="glass-dark absolute left-5 top-5 rounded-full px-3 py-1 text-[10px] tracking-[0.22em] uppercase text-pearl">
                  New arrival
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-serif text-3xl text-pearl">{p.name}</p>
                  <p className="mt-1 text-sm text-pearl/70">{formatPrice(p.price)}</p>
                </div>
              </Link>
            )}
          />
        </Reveal>
      </div>
    </section>
  )
}
