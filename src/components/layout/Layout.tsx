import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SearchOverlay } from '../common/SearchOverlay'
import { ToastStack } from '../common/ToastStack'
import { CursorGlow } from '../fx/CursorGlow'
import { CartDrawer } from './CartDrawer'
import { DemoBanner } from './DemoBanner'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="grain relative min-h-screen bg-ivory text-ink">
      <CursorGlow />
      <DemoBanner />
      <Navbar />
      <main key={location.pathname} className="relative z-[2] animate-fade-in">
        <Outlet />
      </main>
      <Footer />
      <SearchOverlay />
      <CartDrawer />
      <ToastStack />
    </div>
  )
}
