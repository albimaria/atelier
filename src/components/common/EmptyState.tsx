import { Link } from 'react-router-dom'
import { Button } from './Button'

export function EmptyState({
  title,
  text,
  actionLabel,
  to,
}: {
  title: string
  text: string
  actionLabel: string
  to: string
}) {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <p className="text-[11px] tracking-[0.28em] uppercase text-mist">Atelier</p>
      <h1 className="editorial-title mt-4 text-5xl md:text-6xl">{title}</h1>
      <p className="mt-4 text-mist">{text}</p>
      <div className="mt-8">
        <Button to={to}>{actionLabel}</Button>
      </div>
      <Link to="/" className="mt-6 inline-block text-[11px] tracking-[0.18em] uppercase text-mist hover:text-ink">
        Return home
      </Link>
    </div>
  )
}
