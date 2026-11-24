import { Star } from 'lucide-react'

export function RatingStars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-2 text-ink">
      <div className="flex gap-0.5" aria-label={`${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className={i < Math.round(rating) ? 'fill-ink' : 'fill-transparent text-stone'}
          />
        ))}
      </div>
      <span className="text-xs text-mist">
        {rating.toFixed(1)}
        {typeof reviews === 'number' ? ` · ${reviews}` : ''}
      </span>
    </div>
  )
}
