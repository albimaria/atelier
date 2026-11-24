import { CategorySection } from '../components/home/CategorySection'
import { EditorialBanner } from '../components/home/EditorialBanner'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { Hero } from '../components/home/Hero'
import { Newsletter } from '../components/home/Newsletter'
import { NewArrivals } from '../components/home/NewArrivals'
import { ShopByMood } from '../components/home/ShopByMood'
import { Ticker } from '../components/home/Ticker'
import { TrendingProducts } from '../components/home/TrendingProducts'

export function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <CategorySection />
      <FeaturedProducts />
      <NewArrivals />
      <EditorialBanner />
      <ShopByMood />
      <TrendingProducts />
      <Newsletter />
    </>
  )
}
