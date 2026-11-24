import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useUI } from '../../context/UIContext'
import { useWishlist } from '../../context/WishlistContext'
import { useScrolled } from '../../hooks/useScrolled'
import { useTheme } from '../../hooks/useTheme'

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?new=1', label: 'New Arrivals' },
  { to: '/shop?gender=Women', label: 'Women' },
  { to: '/shop?gender=Men', label: 'Men' },
  { to: '/shop?category=Accessories', label: 'Accessories' },
  { to: '/collections', label: 'Collections' },
]

const badge =
  'absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-to-br from-gold to-rose px-1 text-[9px] font-semibold text-void'

export function Navbar() {
  const scrolled = useScrolled()
  const { count } = useCart()
  const { ids } = useWishlist()
  const { setSearchOpen, setCartOpen, menuOpen, setMenuOpen } = useUI()
  const location = useLocation()
  const { user } = useAuth()
  const accountPath = user ? '/profile' : '/login'
  const { theme, toggle: toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search, setMenuOpen])

  return (
    <header className="sticky top-0 z-50 h-20 px-3 pt-3 md:h-24 md:px-6 md:pt-4">
      <div
        className={`mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full px-5 transition-all duration-500 md:h-16 md:px-7 ${
          scrolled
            ? 'glass-strong shadow-[0_20px_50px_-20px_var(--nav-shadow)]'
            : 'border border-line/[0.06] bg-line/[0.03] backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-3 lg:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </button>
        </div>

        <Link to="/" className="group flex items-center gap-2 font-serif text-xl tracking-[0.3em] uppercase md:text-2xl">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rotate-45 bg-gradient-to-br from-gold to-violet transition-transform duration-700 group-hover:rotate-[225deg]"
          />
          Atelier
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end
              className="rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase text-ink/70 transition hover:bg-line/[0.06] hover:text-ink"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            type="button"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-line/[0.08]"
          >
            <span key={theme} className="grid animate-fade-in place-items-center">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </span>
          </button>
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-line/[0.08]"
          >
            <Search size={18} />
          </button>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-10 w-10 place-items-center rounded-full transition hover:bg-line/[0.08] md:grid"
          >
            <Heart size={18} />
            {ids.length > 0 && <span className={badge}>{ids.length}</span>}
          </Link>
          <Link
            to={accountPath}
            aria-label="Account"
            className="hidden h-10 w-10 place-items-center rounded-full transition hover:bg-line/[0.08] md:grid"
          >
            <User size={18} />
          </Link>
          <button
            type="button"
            aria-label="Shopping bag"
            className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-line/[0.08]"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={18} />
            {count > 0 && <span className={badge}>{count}</span>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden bg-ivory/95 backdrop-blur-xl lg:hidden animate-fade-in">
          <div className="flex h-20 items-center justify-between px-6">
            <span className="font-serif text-2xl tracking-[0.28em] uppercase">Atelier</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="glass grid h-11 w-11 place-items-center rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex flex-col gap-5 px-6 pt-8" style={{ perspective: '800px' }}>
            {links.map((link, i) => (
              <Link
                key={link.label}
                to={link.to}
                className="font-serif text-5xl animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 flex gap-6">
              <Link to="/wishlist" className="text-[12px] tracking-[0.2em] uppercase text-mist" onClick={() => setMenuOpen(false)}>
                Wishlist
              </Link>
              <Link to={accountPath} className="text-[12px] tracking-[0.2em] uppercase text-mist" onClick={() => setMenuOpen(false)}>
                {user ? 'Profile' : 'Account'}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
