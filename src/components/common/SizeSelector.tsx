export function SizeSelector({
  sizes,
  value,
  onChange,
}: {
  sizes: string[]
  value: string
  onChange: (size: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const selected = value === size
        return (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={`min-w-12 px-3 py-2 text-[11px] tracking-[0.14em] uppercase border transition ${
              selected ? 'border-ink bg-ink text-ivory' : 'border-stone text-ink hover:border-ink'
            }`}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}
