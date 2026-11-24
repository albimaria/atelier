import { Marquee } from '../fx/Marquee'

const words = ['New season', 'Free shipping over $250', 'Considered essentials', 'Free 14-day returns', 'Autumn 2026']

/** Two crossing ribbons of scrolling text, rotated in 3D. */
export function Ticker() {
  const row = (accent: boolean) =>
    words.map((w) => (
      <span key={w} className="flex items-center gap-8 px-4 font-serif text-2xl italic md:text-4xl">
        <span className={accent ? 'text-void' : 'text-ink'}>{w}</span>
        <span className={accent ? 'text-void/50' : 'text-accent'}>✦</span>
      </span>
    ))

  return (
    <div className="relative z-10 -my-6 overflow-hidden py-14" style={{ perspective: '1000px' }} aria-hidden>
      <div className="-mx-10" style={{ transform: 'rotate(-3deg) rotateX(10deg)' }}>
        <Marquee duration={38} className="bg-gradient-to-r from-gold via-pearl to-gold text-void py-3 shadow-[0_20px_60px_-10px_rgb(227_197_143/0.4)]">
          {row(true)}
        </Marquee>
      </div>
      <div className="-mx-10 -mt-4" style={{ transform: 'rotate(2deg) rotateX(-10deg)' }}>
        <Marquee duration={46} reverse className="glass-strong py-3">
          {row(false)}
        </Marquee>
      </div>
    </div>
  )
}
