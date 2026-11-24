import type { ReactNode } from 'react'
import type { Category } from '../../types'
import { categories } from '../../data/products'

export type ShopFiltersState = {
  category: string
  gender: string
  mood: string
  price: string
  size: string
  color: string
  sort: string
  q: string
  isNew: boolean
}

export const emptyFilters: ShopFiltersState = {
  category: '',
  gender: '',
  mood: '',
  price: '',
  size: '',
  color: '',
  sort: 'featured',
  q: '',
  isNew: false,
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', '36', '38', '40', '41', '42', '43', 'One Size']
const colors = ['Ivory', 'Noir', 'Gold', 'Sand', 'Charcoal', 'Cognac']
const prices = [
  { label: 'Under $150', value: '0-150' },
  { label: '$150 – $300', value: '150-300' },
  { label: '$300 – $600', value: '300-600' },
  { label: '$600+', value: '600-9999' },
]

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="border-b border-sand pb-6">
      <p className="text-[11px] tracking-[0.22em] uppercase">{label}</p>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  )
}

export function FilterList({
  value,
  onChange,
}: {
  value: ShopFiltersState
  onChange: (next: ShopFiltersState) => void
}) {
  const set = (patch: Partial<ShopFiltersState>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-6">
      <Field label="Category">
        {(['All', ...categories] as const).map((cat) => (
          <label key={cat} className="flex items-center gap-2 text-sm text-mist">
            <input
              type="radio"
              name="category"
              checked={(cat === 'All' && !value.category) || value.category === cat}
              onChange={() => set({ category: cat === 'All' ? '' : (cat as Category) })}
            />
            {cat}
          </label>
        ))}
      </Field>
      <Field label="Price">
        {prices.map((p) => (
          <label key={p.value} className="flex items-center gap-2 text-sm text-mist">
            <input
              type="radio"
              name="price"
              checked={value.price === p.value}
              onChange={() => set({ price: value.price === p.value ? '' : p.value })}
            />
            {p.label}
          </label>
        ))}
      </Field>
      <Field label="Size">
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set({ size: value.size === s ? '' : s })}
              className={`px-2 py-1 text-[11px] border ${
                value.size === s ? 'border-ink bg-ink text-ivory' : 'border-stone'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Color">
        {colors.map((c) => (
          <label key={c} className="flex items-center gap-2 text-sm text-mist">
            <input
              type="checkbox"
              checked={value.color === c}
              onChange={() => set({ color: value.color === c ? '' : c })}
            />
            {c}
          </label>
        ))}
      </Field>
      <button
        type="button"
        className="text-[11px] tracking-[0.18em] uppercase text-mist hover:text-ink"
        onClick={() => onChange({ ...emptyFilters, sort: value.sort, q: value.q })}
      >
        Clear filters
      </button>
    </div>
  )
}
