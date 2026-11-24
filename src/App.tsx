import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { CartProvider } from './context/CartContext'
import { UIProvider } from './context/UIContext'
import { WishlistProvider } from './context/WishlistContext'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Collections } from './pages/Collections'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { ProductDetails } from './pages/ProductDetails'
import { Profile } from './pages/Profile'
import { Shop } from './pages/Shop'
import { Wishlist } from './pages/Wishlist'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <UIProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </UIProvider>
    </BrowserRouter>
  )
}
