import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useUI } from '../../context/UIContext'
import { Reveal } from '../common/Reveal'
import { Aurora } from '../fx/Aurora'
import { TiltCard } from '../fx/TiltCard'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const { notify } = useUI()

  return (
    <section className="relative overflow-hidden px-5 py-24 md:px-8 md:py-32">
      <Aurora intensity={0.7} />

      {/* Floating orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute left-[8%] top-[18%] h-24 w-24 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff,#e3c58f_35%,#5a3f1a_80%)] opacity-80 shadow-[0_30px_60px_-10px_rgb(227_197_143/0.5)] md:h-36 md:w-36" />
        <div
          className="animate-float absolute bottom-[14%] right-[10%] h-16 w-16 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff,#b9a6ff_35%,#2b1d6b_80%)] opacity-80 shadow-[0_30px_60px_-10px_rgb(123_97_255/0.5)] md:h-28 md:w-28"
          style={{ animationDelay: '-3s' }}
        />
        <div
          className="animate-spin-slow absolute right-[18%] top-[12%] h-40 w-40 rounded-full border border-dashed border-gold/30 md:h-56 md:w-56"
        />
      </div>

      <Reveal>
        <TiltCard max={6} className="mx-auto max-w-3xl rounded-[36px]">
          <form
            className="glass glow-border relative overflow-hidden rounded-[36px] px-6 py-16 text-center md:px-16 md:py-20"
            onSubmit={(e) => {
              e.preventDefault()
              if (!email.includes('@')) return
              notify('You’re on the list.')
              setEmail('')
            }}
          >
            <p className="eyebrow justify-center">The list</p>
            <h2 className="editorial-title mt-5 text-5xl md:text-7xl">
              Stay in the <em className="text-chrome">know.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-mist">
              New collections, considered pieces and things worth discovering — first.
            </p>
            <div className="mx-auto mt-10 flex max-w-md items-center gap-2 rounded-full border border-line/15 bg-ivory/60 p-1.5 pl-6 transition focus-within:border-gold/60">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-label="Email address"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-mist"
              />
              <button
                type="submit"
                className="btn-shine btn-solid flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-[11px] font-medium tracking-[0.2em] uppercase transition hover:scale-105"
              >
                Join <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </TiltCard>
      </Reveal>
    </section>
  )
}
