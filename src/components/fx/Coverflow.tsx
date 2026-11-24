import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

type Props<T> = {
  items: T[]
  render: (item: T, index: number, active: boolean) => ReactNode
  getLabel?: (item: T) => string
  autoplay?: number
  pauseOnHover?: boolean
  className?: string
}

/**
 * Coverflow: the active card faces the viewer, neighbours swing away on the Y axis.
 * Supports swipe/drag, arrow keys, buttons and optional autoplay.
 */
export function Coverflow<T>({ 
  items, 
  render, 
  getLabel, 
  autoplay = 0, 
  pauseOnHover = true,
  className = '' 
}: Props<T>) {
  const n = items.length
  const [active, setActive] = useState(Math.floor(n / 2))
  const [paused, setPaused] = useState(false)
  const drag = useRef({ x: 0, dx: 0, down: false })
  const [dragX, setDragX] = useState(0)

  const go = useCallback((dir: number) => setActive((a) => (a + dir + n) % n), [n])

  useEffect(() => {
    if (!autoplay || (pauseOnHover && paused)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => go(1), autoplay)
    return () => window.clearInterval(id)
  }, [autoplay, paused, pauseOnHover, go])

  const endDrag = () => {
    const { dx, down } = drag.current
    if (!down) return
    drag.current.down = false
    setDragX(0)
    if (dx < -50) go(1)
    else if (dx > 50) go(-1)
  }

  return (
    <div
      className={`relative ${className}`}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => pauseOnHover && setPaused(false)}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Categories"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1)
          if (e.key === 'ArrowLeft') go(-1)
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, dx: 0, down: true }
        }}
        onPointerMove={(e) => {
          if (!drag.current.down) return
          drag.current.dx = e.clientX - drag.current.x
          setDragX(drag.current.dx)
        }}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (Math.abs(drag.current.dx) > 6) {
            e.preventDefault()
            e.stopPropagation()
            drag.current.dx = 0
          }
        }}
        className="relative h-[440px] touch-pan-y select-none outline-none sm:h-[500px] md:h-[560px]"
        style={{ perspective: '1400px' }}
      >
        <div className="preserve-3d absolute inset-0">
          {items.map((item, i) => {
            // Shortest signed distance on a loop.
            let offset = i - active
            if (offset > n / 2) offset -= n
            if (offset < -n / 2) offset += n
            const abs = Math.abs(offset)
            const visible = abs <= 3
            const o = offset + dragX / 320
            const clamped = Math.max(-1, Math.min(1, o))
            const transform = `translateX(calc(-50% + ${o * 62}%)) translateZ(${-Math.abs(o) * 180}px) rotateY(${clamped * -42}deg)`

            return (
              <div
                key={i}
                className="absolute left-1/2 top-4 h-[380px] w-[250px] sm:h-[440px] sm:w-[300px] md:h-[500px] md:w-[350px]"
                style={{
                  transform,
                  zIndex: 50 - abs,
                  opacity: visible ? 1 - abs * 0.15 : 0,
                  pointerEvents: visible ? 'auto' : 'none',
                  transition: dragX !== 0
                    ? 'none'
                    : 'transform 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease, filter 0.6s ease',
                  filter: offset === 0 ? 'none' : `brightness(${0.7 - abs * 0.1})`,
                }}
                onClick={(e) => {
                  if (offset !== 0) {
                    e.preventDefault()
                    setActive(i)
                  }
                }}
              >
                {render(item, i, offset === 0)}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => go(-1)}
          className="glass grid h-12 w-12 place-items-center rounded-full transition hover:scale-110 hover:border-gold/60"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              aria-label={getLabel ? getLabel(item) : `Slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? 'w-8 bg-gold' : 'w-1.5 bg-ink/25 hover:bg-ink/50'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next"
          onClick={() => go(1)}
          className="glass grid h-12 w-12 place-items-center rounded-full transition hover:scale-110 hover:border-gold/60"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
