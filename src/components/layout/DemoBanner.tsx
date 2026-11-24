import { X } from 'lucide-react'
import { useState } from 'react'

const KEY = 'atelier-demo-banner-dismissed'
export const REPO_URL = 'https://github.com/albimaria/atelier'

/** Makes it unmistakable that this is a portfolio piece, not a real shop. */
export function DemoBanner() {
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(KEY) === '1')
  if (hidden) return null

  return (
    <div className="relative z-[51] bg-gradient-to-r from-gold via-pearl to-gold text-void">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-4 gap-y-1 px-10 py-2 text-center text-[12px] leading-snug md:text-[13px]">
        <p>
          <span className="font-semibold">Portfolio project:</span> a demo storefront built to showcase frontend and backend
          work. It's not a real shop, so nothing is sold, charged or shipped.{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap font-semibold underline underline-offset-2">
            View source ↗
          </a>
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss notice"
        onClick={() => {
          sessionStorage.setItem(KEY, '1')
          setHidden(true)
        }}
        className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full transition hover:bg-void/10"
      >
        <X size={14} />
      </button>
    </div>
  )
}
