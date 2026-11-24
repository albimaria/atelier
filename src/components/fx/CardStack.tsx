import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'

type Props<T> = {
  items: T[]
  render: (item: T, index: number) => ReactNode
  index: number
  onIndexChange: (index: number) => void
  className?: string
}

/**
 * A 3D deck. The top card can be flicked away (drag or buttons); dismissed cards
 * fly out to the side and rejoin the back of the stack.
 */
export function CardStack<T>({ items, render, index: top, onIndexChange, className = '' }: Props<T>) {
  const n = items.length
  const [dx, setDx] = useState(0)
  const drag = useRef({ x: 0, down: false, moved: 0 })

  const go = (dir: number) => onIndexChange((top + dir + n) % n)

  const endDrag = () => {
    if (!drag.current.down) return
    drag.current.down = false
    if (dx < -80) go(1)
    else if (dx > 80) go(-1)
    setDx(0)
  }

  return (
    <div className={className}>
      <div
        className="relative mx-auto aspect-[3/4] w-[min(72vw,360px)] touch-pan-y select-none"
        style={{ perspective: '1200px' }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, down: true, moved: 0 }
        }}
        onPointerMove={(e) => {
          if (!drag.current.down) return
          const d = e.clientX - drag.current.x
          drag.current.moved = Math.abs(d)
          setDx(d)
        }}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (drag.current.moved > 6) {
            e.preventDefault()
            e.stopPropagation()
            drag.current.moved = 0
          }
        }}
      >
        <div className="preserve-3d absolute inset-0">
          {items.map((item, i) => {
            const k = (i - top + n) % n // 0 = top of deck
            const isTop = k === 0
            const flown = k === n - 1 && n > 4 // just dismissed: parked off to the side
            const depth = Math.min(k, 4)
            let transform = `translate3d(${depth * 16}px, ${-depth * 20}px, ${-depth * 70}px) rotateZ(${depth * 3}deg)`
            if (isTop) transform = `translate3d(${dx}px, 0, 40px) rotateZ(${dx * 0.06}deg) rotateY(${dx * 0.04}deg)`
            if (flown) transform = 'translate3d(-135%, 30px, 60px) rotateZ(-18deg) rotateY(-30deg)'

            return (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  transform,
                  zIndex: n - k,
                  opacity: flown || k > 4 ? 0 : 1,
                  filter: isTop ? 'none' : `brightness(${0.8 - depth * 0.12})`,
                  transition:
                    isTop && dx !== 0
                      ? 'none'
                      : 'transform 0.75s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease, filter 0.5s ease',
                  pointerEvents: isTop ? 'auto' : 'none',
                }}
              >
                {render(item, i)}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => go(-1)}
          className="glass grid h-12 w-12 place-items-center rounded-full transition hover:-translate-x-1 hover:border-gold/60"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="min-w-20 text-center font-serif text-xl tabular-nums">
          {String(top + 1).padStart(2, '0')} <span className="text-mist">/ {String(n).padStart(2, '0')}</span>
        </span>
        <button
          type="button"
          aria-label="Next"
          onClick={() => go(1)}
          className="glass grid h-12 w-12 place-items-center rounded-full transition hover:translate-x-1 hover:border-gold/60"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
