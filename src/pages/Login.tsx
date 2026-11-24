import { Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { ApiError, useApiStatus } from '../services/api'

type Mode = 'signin' | 'register'

const field =
  'w-full rounded-2xl border border-line/15 bg-paper/60 px-4 py-3.5 outline-none transition placeholder:text-mist focus:border-accent'

export function Login() {
  const navigate = useNavigate()
  const { notify } = useUI()
  const { signIn, register, signInDemo } = useAuth()
  const { status } = useApiStatus()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState<'form' | 'demo' | null>(null)
  const [error, setError] = useState<{ message: string; fields?: Record<string, string> } | null>(null)

  async function run(kind: 'form' | 'demo', action: () => Promise<{ name: string; local?: boolean }>) {
    setBusy(kind)
    setError(null)
    try {
      const user = await action()
      notify(user.local ? 'Signed in locally (API offline)' : `Welcome, ${user.name}`)
      navigate('/profile')
    } catch (e) {
      if (e instanceof ApiError) {
        const fields = Object.fromEntries((e.details ?? []).map((d) => [d.path, d.message]))
        setError({ message: e.message, fields })
      } else {
        setError({ message: 'Something went wrong. Please try again.' })
      }
    } finally {
      setBusy(null)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    run('form', () => (mode === 'signin' ? signIn(email, password) : register(name, email, password)))
  }

  const waking = status === 'connecting' || status === 'waking'

  return (
    <div className="mx-auto max-w-md px-5 py-16 md:py-24">
      <p className="eyebrow">Account</p>
      <h1 className="editorial-title mt-4 text-5xl md:text-6xl">
        {mode === 'signin' ? 'Welcome back' : 'Create account'}
      </h1>

      {/* One-click demo for reviewers */}
      <button
        type="button"
        onClick={() => run('demo', signInDemo)}
        disabled={busy !== null}
        className="glass glow-border group mt-10 flex w-full items-center gap-4 rounded-3xl p-5 text-left transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-violet text-void">
          <Sparkles size={18} />
        </span>
        <span>
          <span className="block font-medium">{busy === 'demo' ? 'Signing in…' : 'Explore with the demo account'}</span>
          <span className="mt-0.5 block text-sm text-mist">
            Pre-filled wishlist and order history. No sign-up needed.
          </span>
        </span>
      </button>

      <div className="my-8 flex items-center gap-4 text-[11px] tracking-[0.2em] uppercase text-mist">
        <span className="h-px flex-1 bg-line/10" /> or <span className="h-px flex-1 bg-line/10" />
      </div>

      <div className="mb-6 grid grid-cols-2 rounded-full border border-line/10 p-1 text-[11px] tracking-[0.18em] uppercase">
        {(['signin', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m)
              setError(null)
            }}
            className={`rounded-full py-2.5 transition ${mode === m ? 'bg-ink text-ivory' : 'text-mist hover:text-ink'}`}
          >
            {m === 'signin' ? 'Sign in' : 'Register'}
          </button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {mode === 'register' && (
          <div>
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              aria-label="Full name"
              className={field}
            />
            {error?.fields?.name && <p className="mt-1.5 text-sm text-rose">{error.fields.name}</p>}
          </div>
        )}
        <div>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            aria-label="Email address"
            className={field}
          />
          {error?.fields?.email && <p className="mt-1.5 text-sm text-rose">{error.fields.email}</p>}
        </div>
        <div>
          <input
            required
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signin' ? 'Password' : 'Password (8+ characters)'}
            aria-label="Password"
            className={field}
          />
          {error?.fields?.password && <p className="mt-1.5 text-sm text-rose">{error.fields.password}</p>}
        </div>

        {error && !Object.keys(error.fields ?? {}).length && (
          <p role="alert" className="rounded-2xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm">
            {error.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={busy !== null}>
          {busy === 'form' ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <p className="mt-8 text-sm leading-relaxed text-mist">
        {waking && 'Waking the demo server. The first request can take up to a minute on free hosting. '}
        {status === 'offline' || status === 'disabled'
          ? 'The API is offline, so accounts are saved in this browser only.'
          : 'This is a portfolio demo. Use any email; please don’t reuse a real password.'}
      </p>
    </div>
  )
}
