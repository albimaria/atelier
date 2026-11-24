import { API_DOCS_URL, useApiStatus } from '../../services/api'

const label = {
  disabled: 'Local demo mode',
  connecting: 'Connecting to API…',
  waking: 'Waking API (free tier, up to a minute)…',
  online: 'API online',
  offline: 'API offline · local demo mode',
} as const

const dot = {
  disabled: 'bg-stone',
  connecting: 'bg-gold animate-pulse',
  waking: 'bg-gold animate-pulse',
  online: 'bg-emerald-500',
  offline: 'bg-rose',
} as const

/** Shows whether the storefront is talking to the live backend. */
export function ApiStatusBadge() {
  const { status, latencyMs } = useApiStatus()
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
      <span className="inline-flex items-center gap-2 rounded-full border border-line/15 px-3 py-1.5" role="status">
        <span className={`h-2 w-2 rounded-full ${dot[status]}`} />
        {label[status]}
        {status === 'online' && latencyMs !== null && <span className="text-mist">· {latencyMs}ms</span>}
      </span>
      {API_DOCS_URL && (
        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line/15 px-3 py-1.5 transition hover:border-accent hover:text-accent"
        >
          API docs ↗
        </a>
      )}
    </div>
  )
}
