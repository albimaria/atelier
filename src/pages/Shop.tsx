import { SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FilterList, type ShopFiltersState } from '../components/product/FilterList'
import { FilterSheet } from '../components/product/FilterSheet'
import { ProductGrid } from '../components/product/ProductGrid'
import { products } from '../data/products'
import type { Product } from '../types'

function fromParams(params: URLSearchParams): ShopFiltersState {
  return {
    category: params.get('category') ?? '',
    gender: params.get('gender') ?? '',
    mood: params.get('mood') ?? '',
    price: params.get('price') ?? '',
    size: params.get('size') ?? '',
    color: params.get('color') ?? '',
    sort: params.get('sort') ?? 'featured',
    q: params.get('q') ?? '',
    isNew: params.get('new') === '1',
  }
}

function applyFilters(list: Product[], f: ShopFiltersState) {
  let next = list.filter((p) => {
    if (f.category && p.category !== f.category) return false
    if (f.gender && p.gender !== f.gender && p.gender !== 'Unisex') return false
    if (f.mood && p.mood !== f.mood) return false
    if (f.isNew && !p.isNew) return false
    if (f.q) {
      const q = f.q.toLowerCase()
      if (!`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)) return false
    }
    if (f.size && !p.sizes.includes(f.size)) return false
    if (f.color && !p.colors.some((c) => c.name === f.color)) return false
    if (f.price) {
      const [min, max] = f.price.split('-').map(Number)
      if (p.price < min || p.price > max) return false
    }
    return true
  })

  switch (f.sort) {
    case 'newest':
      next = [...next].sort((a, b) => Number(b.isNew) - Number(a.isNew))
      break
    case 'price-asc':
      next = [...next].sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      next = [...next].sort((a, b) => b.price - a.price)
      break
    case 'rating':
      next = [...next].sort((a, b) => b.rating - a.rating)
      break
    default:
      next = [...next].sort((a, b) => Number(b.isTrending) - Number(a.isTrending))
  }
  return next
}

export function Shop() {
  const [params, setParams] = useSearchParams()
  const filters = fromParams(params)
  const [sheet, setSheet] = useState(false)
  const [search, setSearch] = useState(filters.q)

  const results = useMemo(() => applyFilters(products, filters), [filters])

  function write(next: ShopFiltersState) {
    const p = new URLSearchParams()
    if (next.category) p.set('category', next.category)
    if (next.gender) p.set('gender', next.gender)
    if (next.mood) p.set('mood', next.mood)
    if (next.price) p.set('price', next.price)
    if (next.size) p.set('size', next.size)
    if (next.color) p.set('color', next.color)
    if (next.sort && next.sort !== 'featured') p.set('sort', next.sort)
    if (next.q) p.set('q', next.q)
    if (next.isNew) p.set('new', '1')
    setParams(p)
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
      <p className="text-[11px] tracking-[0.28em] uppercase text-mist">Shop</p>
      <h1 className="editorial-title mt-2 text-5xl md:text-7xl">The collection</h1>
      <p className="mt-4 max-w-xl text-mist">
        {results.length} piece{results.length === 1 ? '' : 's'}
        {filters.category ? ` in ${filters.category}` : ''}
        {filters.mood ? ` · ${filters.mood}` : ''}
      </p>

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form
          className="flex-1 border-b border-ink"
          onSubmit={(e) => {
            e.preventDefault()
            write({ ...filters, q: search })
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pieces"
            className="w-full bg-transparent py-2 outline-none"
          />
        </form>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase md:hidden"
            onClick={() => setSheet(true)}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            value={filters.sort}
            onChange={(e) => write({ ...filters, sort: e.target.value })}
            className="bg-transparent text-[11px] tracking-[0.16em] uppercase outline-none"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <FilterList value={filters} onChange={write} />
        </aside>
        <ProductGrid products={results} />
      </div>

      <FilterSheet open={sheet} onClose={() => setSheet(false)} value={filters} onChange={write} />
    </div>
  )
}
