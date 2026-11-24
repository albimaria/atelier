import { useEffect, useRef } from 'react'

/** A soft spotlight that trails the cursor on fine-pointer devices. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let x = tx
    let y = ty
    let raf = 0

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      el.style.opacity = '1'
    }
    const tick = () => {
      x += (tx - x) * 0.12
      y += (ty - y) * 0.12
      el.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] h-[600px] w-[600px] rounded-full opacity-0 transition-opacity duration-700"
      style={{
        background: 'radial-gradient(circle, rgb(123 97 255 / 0.10), rgb(227 197 143 / 0.05) 40%, transparent 70%)',
      }}
    />
  )
}
