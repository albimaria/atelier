import { Minus, Plus } from 'lucide-react'

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="inline-flex items-center border border-stone">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="grid h-10 w-10 place-items-center text-ink hover:bg-sand/50"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={14} />
      </button>
      <span className="min-w-8 text-center text-sm">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="grid h-10 w-10 place-items-center text-ink hover:bg-sand/50"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
