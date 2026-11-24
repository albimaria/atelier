import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { useUI } from '../context/UIContext'

const KEY = 'atelier-user'

export function Login() {
  const navigate = useNavigate()
  const { notify } = useUI()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="text-[11px] tracking-[0.28em] uppercase text-mist">Account</p>
      <h1 className="editorial-title mt-3 text-5xl">Welcome back</h1>
      <form
        className="mt-10 space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          localStorage.setItem(KEY, JSON.stringify({ email, name: email.split('@')[0] }))
          notify('Signed in')
          navigate('/profile')
        }}
      >
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full border-b border-ink bg-transparent py-3 outline-none"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border-b border-ink bg-transparent py-3 outline-none"
        />
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-8 text-sm text-mist">
        Demo only — any email and password will create a local session.{' '}
        <Link to="/profile" className="text-ink underline-offset-4 hover:underline">
          View profile
        </Link>
      </p>
    </div>
  )
}
