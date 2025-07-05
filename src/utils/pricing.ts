import { formatCurrency } from './currency'

export function calculateSellingPrice(price: number | null | undefined, utility: number | null | undefined): string {
  const basePrice = price ?? 0
  const utilityRate = utility ?? 0

  return formatCurrency(basePrice * (1 + utilityRate / 100))
}
//**
// Calculate total price based on selling price, utility, and quantity
// @param price - Base price of the product
// @param utility - Utility percentage to apply
// @param quantity - Quantity of the product
// @returns Formatted total price as a string
// */
export function calculateTotalPrice(price: number | null | undefined, utility: number | null | undefined, quantity: number): string {
  const sellingPrice = parseFloat(calculateSellingPrice(price, utility).replace(/[^0-9.-]+/g, '')) || 0
  return formatCurrency(sellingPrice * quantity)
}
