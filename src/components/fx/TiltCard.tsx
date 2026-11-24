import { useRef, type ReactNode, type PointerEvent } from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** Max rotation in degrees. */
  max?: number
  glare?: boolean
}

/** Pointer-driven 3D tilt with a moving specular glare. Mouse/pen only. */
export function TiltCard({ children, className = '', max = 10, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`)
    el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`)
    el.style.setProperty('--gx', `${px * 100}%`)
    el.style.setProperty('--gy', `${py * 100}%`)
    el.dataset.active = 'true'
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.dataset.active = 'false'
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt relative ${className}`}>
      {children}
      {glare && <div className="tilt-glare z-20" />}
    </div>
  )
}
