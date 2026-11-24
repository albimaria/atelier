/** Slow-drifting blurred colour fields used as ambient section backgrounds. */
export function Aurora({ className = '', intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ opacity: intensity }}>
      <div className="aurora-blob left-[-10%] top-[-10%] h-[55vmax] w-[55vmax] bg-violet/50" />
      <div
        className="aurora-blob right-[-15%] top-[10%] h-[45vmax] w-[45vmax] bg-gold/35"
        style={{ animationDelay: '-6s', animationDuration: '22s' }}
      />
      <div
        className="aurora-blob bottom-[-20%] left-[25%] h-[40vmax] w-[40vmax] bg-rose/25"
        style={{ animationDelay: '-12s', animationDuration: '26s' }}
      />
    </div>
  )
}
