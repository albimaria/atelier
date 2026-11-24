export type Category =
  | 'Shoes'
  | 'Dresses'
  | 'Clothing'
  | 'Scents'
  | 'Bags'
  | 'Watches'
  | 'Jewelry'
  | 'Sunglasses'
  | 'Accessories'
  | 'Lifestyle'

export type Gender = 'Women' | 'Men' | 'Unisex'

export type Mood = 'Minimal' | 'After Dark' | 'Weekend' | 'Statement' | 'Everyday'

export type ProductColor = {
  name: string
  hex: string
}

export type Review = {
  id: string
  author: string
  rating: number
  text: string
  date: string
}

export type Product = {
  id: string
  name: string
  category: Category
  gender: Gender
  mood: Mood
  price: number
  originalPrice: number | null
  description: string
  images: string[]
  colors: ProductColor[]
  sizes: string[]
  rating: number
  reviews: Review[]
  isNew: boolean
  isTrending: boolean
  isSale: boolean
  details: string
  materials: string
}

export type CartItem = {
  productId: string
  size: string
  color: string
  quantity: number
}

export type Toast = {
  id: string
  message: string
  tone?: 'default' | 'success'
}
