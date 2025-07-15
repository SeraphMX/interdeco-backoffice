import { formatCurrency } from './currency'

export function calculateSellingPriceRaw(price: number | null | undefined, utility: number | null | undefined): number {
  const basePrice = price ?? 0
  const utilityRate = utility ?? 0
  return basePrice * (1 + utilityRate / 100) // ⚠️ sin redondear aquí
}

export function calculateSellingPrice(price: number | null | undefined, utility: number | null | undefined): string {
  return formatCurrency(calculateSellingPriceRaw(price, utility))
}

export function calculateTotalPrice(price: number | null | undefined, utility: number | null | undefined, quantity: number): string {
  const unitPrice = calculateSellingPriceRaw(price, utility)
  const total = unitPrice * quantity
  return formatCurrency(total)
}
