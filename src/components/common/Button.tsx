import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  to?: string
  onClick?: () => void
  children: ReactNode
  variant?: 'solid' | 'outline' | 'ghost'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({
  to,
  onClick,
  children,
  variant = 'solid',
  className = '',
  type = 'button',
  disabled,
}: Props) {
  const styles = {
    solid: 'btn-shine btn-solid rounded-full hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0',
    outline:
      'btn-shine glass rounded-full text-ink hover:-translate-y-0.5 hover:border-gold/60 disabled:opacity-40',
    ghost: 'text-ink hover:text-accent disabled:opacity-40',
  }[variant]

  const cls = `inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-300 ${styles} ${className}`

  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}
