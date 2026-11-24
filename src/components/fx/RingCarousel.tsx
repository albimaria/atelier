import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props<T> = {
  items: T[]
  render: (item: T, index: number) => ReactNode
  /** Degrees per second of idle auto-rotation. */
  speed?: number
  /** Whether to pause auto-rotation on hover. */
  pauseOnHover?: boolean
  /** Card width as a fraction of the container width, clamped to [min,max] px. */
  widthRatio?: number
  minWidth?: number
  maxWidth?: number
  /** Aspect ratio of each card (height / width). */
  aspect?: number
  /** Camera tilt in degrees. */
  tilt?: number
  className?: string
}

/**
 * A draggable 3D cylinder carousel. Items sit on a ring and rotate around the Y axis.
 * Transforms are written directly to the DOM each frame, so dragging never re-renders React.
 */
export function RingCarousel<T>({
  items,
  render,
  speed = 8,
  pauseOnHover = true,
  widthRatio = 0.17,
  minWidth = 130,
  maxWidth = 250,
  aspect = 1.35,
  tilt = -8,
  className = '',
}: Props<T>) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [cardW, setCardW] = useState(200)

  const n = items.length
  const step = 360 / n
  const radius = Math.round(cardW / 2 / Math.tan(Math.PI / n) + cardW * 0.28)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setCardW(Math.max(minWidth, Math.min(maxWidth, w * widthRatio)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [minWidth, maxWidth, widthRatio])

  useEffect(() => {
    const wrap = wrapRef.current
    const ring = ringRef.current
    if (!wrap || !ring) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let angle = 0
    let velocity = 0
    let dragging = false
    let lastX = 0
    let moved = 0
    let hovering = false
    let last = performance.now()
    let raf = 0

    const paint = () => {
      ring.style.transform = `translateZ(${-radius}px) rotateX(${tilt}deg) rotateY(${angle}deg)`
      // Depth cue: dim and desaturate cards as they rotate away from the viewer.
      for (let i = 0; i < n; i++) {
        const card = cardRefs.current[i]
        if (!card) continue
        const a = ((i * step + angle) % 360 + 360) % 360
        const facing = Math.cos((a * Math.PI) / 180) // 1 front, -1 back
        const t = (facing + 1) / 2
        card.style.filter = `brightness(${0.35 + t * 0.65}) saturate(${0.4 + t * 0.6})`
        card.style.zIndex = String(Math.round(t * 100))
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000
      last = now
      if (!dragging) {
        if (Math.abs(velocity) > 0.5) {
          angle += velocity * dt
          velocity *= Math.pow(0.04, dt)
        } else if (!reduced && (!pauseOnHover || !hovering)) {
          angle -= speed * dt
        }
      }
      paint()
      raf = requestAnimationFrame(tick)
    }

    const onDown = (e: PointerEvent) => {
      dragging = true
      moved = 0
      lastX = e.clientX
      velocity = 0
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      moved += Math.abs(dx)
      const delta = dx * 0.25
      angle += delta
      velocity = delta * 60
    }
    const onUp = () => {
      dragging = false
    }
    // Swallow the click that ends a drag so links don't fire.
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    const onEnter = () => (hovering = true)
    const onLeave = () => (hovering = false)

    wrap.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    wrap.addEventListener('click', onClick, true)
    wrap.addEventListener('pointerenter', onEnter)
    wrap.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      wrap.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      wrap.removeEventListener('click', onClick, true)
      wrap.removeEventListener('pointerenter', onEnter)
      wrap.removeEventListener('pointerleave', onLeave)
    }
  }, [n, step, radius, speed, tilt, pauseOnHover])

  const cardH = cardW * aspect

  return (
    <div
      ref={wrapRef}
      className={`relative w-full cursor-grab touch-pan-y select-none active:cursor-grabbing ${className}`}
      style={{ height: cardH * 1.35, perspective: `${Math.max(900, radius * 3)}px` }}
    >
      <div
        ref={ringRef}
        className="preserve-3d absolute left-1/2 top-1/2"
        style={{ width: cardW, height: cardH, marginLeft: -cardW / 2, marginTop: -cardH / 2 }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="absolute inset-0"
            style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)` }}
          >
            {render(item, i)}
          </div>
        ))}
      </div>
    </div>
  )
}
