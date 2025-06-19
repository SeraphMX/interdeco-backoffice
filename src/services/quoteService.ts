import { Product, QuoteItem } from '../types'

export type DiscountType = 'percentage' | 'fixed'

export interface QuoteItemOptions {
  product: Product
  requiredQuantity: number
  discount?: number
  discountType?: DiscountType
  id?: string // por si actualizas un item existente
}

const round = (num: number, decimals = 2) => Number(num.toFixed(decimals))

export const quoteService = {
  buildQuoteItem({ product, requiredQuantity, discount = 0, discountType = 'percentage', id }: QuoteItemOptions): QuoteItem {
    const packageUnit = product.package_unit ?? 1

    const packagesRequired = packageUnit > 1 ? Math.ceil(requiredQuantity / packageUnit) : requiredQuantity

    const totalQuantity = packageUnit > 1 ? packagesRequired * packageUnit : requiredQuantity

    const unitPrice = (product.price ?? 0) * (1 + (product.utility ?? 0) / 100) * packageUnit
    const originalSubtotal = round(unitPrice * packagesRequired)

    let subtotal = originalSubtotal

    if (discount > 0) {
      subtotal = discountType === 'percentage' ? round(originalSubtotal * (1 - discount / 100)) : round(originalSubtotal - discount)
    }

    return {
      id: id ?? crypto.randomUUID(),
      product,
      requiredQuantity,
      packagesRequired,
      totalQuantity,
      originalSubtotal,
      subtotal,
      discount,
      discountType
    }
  }
}
