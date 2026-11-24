export function shippingCost(subtotal: number) {
  if (subtotal === 0) return 0
  return subtotal >= 250 ? 0 : 18
}

export function estimateTax(subtotal: number) {
  return Math.round(subtotal * 0.08)
}
