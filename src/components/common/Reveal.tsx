import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Scroll-triggered entrance: content swings up out of the page in 3D. */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const ease = 'cubic-bezier(0.22,1,0.36,1)'

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'perspective(1000px) translateY(40px) rotateX(-14deg) scale(0.97)',
        transformOrigin: '50% 100%',
        transition: `opacity 0.9s ${ease} ${delay}ms, transform 1s ${ease} ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
