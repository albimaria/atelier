import { Link } from 'react-router-dom'
import { ApiStatusBadge } from './ApiStatusBadge'
import { REPO_URL } from './DemoBanner'

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'New Arrivals', to: '/shop?new=1' },
      { label: 'Shoes', to: '/shop?category=Shoes' },
      { label: 'Dresses', to: '/shop?category=Dresses' },
      { label: 'Clothing', to: '/shop?category=Clothing' },
      { label: 'Accessories', to: '/shop?category=Accessories' },
      { label: 'Scents', to: '/shop?category=Scents' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', to: '/profile' },
      { label: 'Journal', to: '/collections' },
      { label: 'Sustainability', to: '/collections' },
      { label: 'Careers', to: '/profile' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact', to: '/checkout' },
      { label: 'Shipping', to: '/checkout' },
      { label: 'Returns', to: '/checkout' },
      { label: 'FAQ', to: '/checkout' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Instagram', to: 'https://instagram.com', external: true },
      { label: 'Pinterest', to: 'https://pinterest.com', external: true },
      { label: 'TikTok', to: 'https://tiktok.com', external: true },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line/10 bg-paper">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[70%] -translate-x-1/2 rounded-full bg-violet/10 blur-[100px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-5 md:px-8">
        <div>
          <p className="font-serif text-2xl tracking-[0.28em] uppercase">Atelier</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">
            Curated essentials for those who move differently.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] tracking-[0.24em] uppercase text-ink">{col.title}</p>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  {'external' in link && link.external ? (
                    <a
                      href={link.to}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-mist transition hover:pl-1 hover:text-ink"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to} className="text-sm text-mist transition hover:pl-1 hover:text-ink">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div aria-hidden className="relative select-none overflow-hidden" style={{ perspective: '800px' }}>
        <p
          className="text-chrome text-center font-serif text-[22vw] leading-[0.8] tracking-[-0.04em] opacity-25"
          style={{ transform: 'rotateX(35deg)', transformOrigin: '50% 100%' }}
        >
          ATELIER
        </p>
      </div>
      <div className="relative space-y-4 border-t border-line/10 px-5 py-6 text-center text-xs text-mist md:px-8">
        <ApiStatusBadge />
        <p>
          © {new Date().getFullYear()} Atelier. A portfolio project by Albi Maria, not a real store.{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
            Source code
          </a>
        </p>
      </div>
    </footer>
  )
}
