export function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function img(id: string, width = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`
}
