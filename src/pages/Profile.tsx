import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { useWishlist } from '../context/WishlistContext'

type User = { email: string; name: string }

function readUser(): User | null {
  try {
    const raw = localStorage.getItem('atelier-user')
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function Profile() {
  const user = readUser()
  const { ids } = useWishlist()

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="editorial-title text-5xl">Your atelier</h1>
        <p className="mt-4 text-mist">Sign in to view saved pieces and order history.</p>
        <div className="mt-8">
          <Button to="/login">Sign in</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <p className="text-[11px] tracking-[0.28em] uppercase text-mist">Profile</p>
      <h1 className="editorial-title mt-3 text-5xl capitalize">{user.name}</h1>
      <p className="mt-2 text-mist">{user.email}</p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Link to="/wishlist" className="border border-sand p-6 hover:border-ink">
          <p className="text-[11px] tracking-[0.2em] uppercase text-mist">Wishlist</p>
          <p className="mt-3 font-serif text-3xl">{ids.length} saved</p>
        </Link>
        <div className="border border-sand p-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-mist">Orders</p>
          <p className="mt-3 font-serif text-3xl">None yet</p>
          <p className="mt-2 text-sm text-mist">Your first order will appear here.</p>
        </div>
      </div>

      <button
        type="button"
        className="mt-10 text-[11px] tracking-[0.18em] uppercase text-mist hover:text-ink"
        onClick={() => {
          localStorage.removeItem('atelier-user')
          window.location.reload()
        }}
      >
        Sign out
      </button>
    </div>
  )
}
