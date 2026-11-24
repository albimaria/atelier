import { X } from 'lucide-react'
import { FilterList, type ShopFiltersState } from './FilterList'
import { useLockBody } from '../../hooks/useLockBody'

export function FilterSheet({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean
  onClose: () => void
  value: ShopFiltersState
  onChange: (next: ShopFiltersState) => void
}) {
  useLockBody(open)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] md:hidden">
      <button type="button" aria-label="Close filters" className="absolute inset-0 bg-void/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl glass-strong px-5 py-6 animate-slide-up">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[12px] tracking-[0.22em] uppercase">Filters</h2>
          <button type="button" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <FilterList value={value} onChange={onChange} />
        <button
          type="button"
          className="mt-6 w-full bg-ink py-3 text-[11px] tracking-[0.2em] uppercase text-ivory"
          onClick={onClose}
        >
          View results
        </button>
      </div>
    </div>
  )
}
