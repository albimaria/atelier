import type { ReactNode } from 'react'
import { Reveal } from '../common/Reveal'

type Props = {
  index: string
  eyebrow: string
  title: ReactNode
  aside?: ReactNode
  align?: 'left' | 'center'
}

export function SectionHeading({ index, eyebrow, title, aside, align = 'left' }: Props) {
  const center = align === 'center'
  return (
    <Reveal>
      <div className={`mb-12 flex gap-6 md:mb-16 ${center ? 'flex-col items-center text-center' : 'items-end justify-between'}`}>
        <div>
          <p className="eyebrow">
            <span className="font-serif text-sm tracking-normal text-accent">{index}</span>
            {eyebrow}
          </p>
          <h2 className="editorial-title mt-4 text-5xl md:text-7xl">{title}</h2>
        </div>
        {aside}
      </div>
    </Reveal>
  )
}
