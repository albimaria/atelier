import type { ProductColor } from '../../types'

export function ColorSelector({
  colors,
  value,
  onChange,
}: {
  colors: ProductColor[]
  value: string
  onChange: (name: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => {
        const selected = value === color.name
        return (
          <button
            key={color.name}
            type="button"
            aria-label={color.name}
            aria-pressed={selected}
            onClick={() => onChange(color.name)}
            className={`h-8 w-8 rounded-full border transition ${
              selected ? 'border-ink scale-110' : 'border-stone hover:border-ink'
            }`}
            style={{ background: color.hex }}
          />
        )
      })}
    </div>
  )
}
