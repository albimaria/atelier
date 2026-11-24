import { X } from 'lucide-react'
import { useUI } from '../../context/UIContext'

export function ToastStack() {
  const { toasts, dismissToast } = useUI()

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[80] flex w-[min(92vw,320px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start justify-between gap-3 glass-strong glow-border rounded-2xl px-4 py-3 text-ink shadow-[0_20px_60px_-10px_rgb(0_0_0/0.8)] animate-fade-in"
        >
          <p className="text-sm leading-snug">{toast.message}</p>
          <button type="button" aria-label="Dismiss" onClick={() => dismissToast(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
