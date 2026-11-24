import { ArrowUpRight, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUI } from '../../context/UIContext'
import { products } from '../../data/products'
import { useLockBody } from '../../hooks/useLockBody'
import { formatPrice } from '../../utils/format'

const popular = ['Shoes', 'Dresses', 'Scents', 'Watches', 'Bags']
const STORAGE = 'atelier-recent-searches'

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI()
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>([])

  useLockBody(searchOpen)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE)
      setRecent(raw ? (JSON.parse(raw) as string[]) : ['Silk dress', 'Runner', 'Santal'])
    } catch {
      setRecent(['Silk dress', 'Runner', 'Santal'])
    }
  }, [])

  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, setSearchOpen])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [query])

  function remember(term: string) {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6)
    setRecent(next)
    localStorage.setItem(STORAGE, JSON.stringify(next))
  }

  if (!searchOpen) return null

  return (
    <div className="fixed inset-0 z-[70] bg-ivory/90 backdrop-blur-xl animate-fade-in">
      <div className="mx-auto max-w-3xl px-5 pt-10 md:pt-16">
        <div className="flex items-center gap-4 border-b border-ink pb-3">
          <Search size={20} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the collection"
            className="w-full bg-transparent text-2xl font-serif outline-none placeholder:text-stone"
          />
          <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {!query && (
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-mist">Recent searches</p>
              <ul className="mt-4 space-y-3">
                {recent.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      className="text-lg hover:text-accent"
                      onClick={() => setQuery(term)}
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-mist">Popular categories</p>
              <ul className="mt-4 space-y-3">
                {popular.map((cat) => (
                  <li key={cat}>
                    <Link
                      to={`/shop?category=${cat}`}
                      onClick={() => setSearchOpen(false)}
                      className="group inline-flex items-center gap-2 text-lg hover:text-accent"
                    >
                      {cat}
                      <ArrowUpRight size={16} className="opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {query && (
          <div className="mt-8 space-y-4">
            {results.length === 0 && <p className="text-mist">No pieces found.</p>}
            {results.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                onClick={() => {
                  remember(query)
                  setSearchOpen(false)
                }}
                className="flex items-center gap-4 border-b border-sand pb-4 hover:opacity-80"
              >
                <img src={product.images[0]} alt="" className="h-20 w-16 object-cover" />
                <div className="flex-1">
                  <p className="text-[10px] tracking-[0.18em] uppercase text-mist">{product.category}</p>
                  <p className="font-serif text-xl">{product.name}</p>
                </div>
                <p className="text-sm">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
