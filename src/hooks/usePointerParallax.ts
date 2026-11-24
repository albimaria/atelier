import { useEffect, type RefObject } from 'react'

/**
 * Writes smoothed pointer position (-1..1) to `--px` / `--py` CSS variables on the
 * target element, so children can derive parallax transforms without re-rendering.
 */
export function usePointerParallax(ref: RefObject<HTMLElement | null>, ease = 0.08) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    let raf = 0

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width) * 2 - 1
      ty = ((e.clientY - r.top) / r.height) * 2 - 1
    }
    const onLeave = () => {
      tx = 0
      ty = 0
    }

    const tick = () => {
      x += (tx - x) * ease
      y += (ty - y) * ease
      el.style.setProperty('--px', x.toFixed(4))
      el.style.setProperty('--py', y.toFixed(4))
      raf = requestAnimationFrame(tick)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [ref, ease])
}
