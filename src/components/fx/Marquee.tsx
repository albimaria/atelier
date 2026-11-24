import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  duration?: number
  reverse?: boolean
  className?: string
  pauseOnHover?: boolean
}

/** Seamless infinite horizontal loop. Content is rendered twice. */
export function Marquee({ children, duration = 40, reverse, className = '', pauseOnHover }: Props) {
  return (
    <div className={`overflow-hidden ${pauseOnHover ? 'marquee-pause' : ''} ${className}`}>
      <div
        className="marquee-track flex w-max"
        style={
          {
            '--marquee-duration': `${duration}s`,
            '--marquee-direction': reverse ? 'reverse' : 'normal',
          } as CSSProperties
        }
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
