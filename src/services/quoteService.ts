import { supabase } from '../lib/supabase'
import { Product, Quote, QuoteItem, QuoteItemDB } from '../types'

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
  buildQuoteItem({ product, requiredQuantity, discount = 0, discountType = 'percentage' }: QuoteItemOptions): QuoteItem {
    const packageUnit = product.package_unit ?? 1

    const packagesRequired = packageUnit > 1 ? Math.ceil(requiredQuantity / packageUnit) : requiredQuantity

    const totalQuantity = packageUnit > 1 ? packagesRequired * packageUnit : requiredQuantity

    const unitPrice = (product.price ?? 0) * (1 + (product.utility ?? 0) / 100) * packageUnit
    const originalSubtotal = round(unitPrice * packagesRequired)

    let subtotal = originalSubtotal

    //TODO:Revisar descuentos globales
    if (discount > 0) {
      subtotal = discountType === 'percentage' ? round(originalSubtotal * (1 - discount / 100)) : round(originalSubtotal - discount)
    }

    return {
      product,
      requiredQuantity,
      packagesRequired,
      totalQuantity,
      originalSubtotal,
      subtotal,
      discount,
      discountType
    }
  },
  async saveQuote(quote: Quote): Promise<{ success: boolean; quote?: Quote; error?: string }> {
    try {
      console.log('Guardando cotización:', quote)

      // 1. Insertar la cotización
      const { data: quoteResult, error: insertQuoteError } = await supabase
        .from('quotes')
        .insert({
          customer_id: quote.customer_id || null, // Asegurarse de que customer_id sea null si no está definido
          total: quote.total
        })
        .select()
        .single() // Usar .single() para obtener un solo registro

      if (insertQuoteError) throw insertQuoteError

      const quoteId = quoteResult?.id
      if (!quoteId) throw new Error('No se pudo obtener el ID de la cotización insertada')

      console.log('ID de cotización insertada:', quoteId)
      // 2. Insertar todos los ítems relacionados a la cotización
      const quoteItems = (quote.items ?? []).map((item: QuoteItem) => ({
        quote_id: quoteId,
        product_id: item.product?.id ?? null,
        description: ` ${item.product?.sku ?? ''} ${item.product?.description ?? ''}`,
        unit_price: item.product?.price ?? 0,
        required_quantity: item.requiredQuantity,
        total_quantity: item.totalQuantity,
        packages_required: item.packagesRequired,
        subtotal: item.subtotal,
        discount_type: item.discountType,
        original_subtotal: item.originalSubtotal,
        discount: item.discount
      }))

      const { error: insertQuoteItemsError } = await supabase.from('quote_items').insert(quoteItems)

      if (insertQuoteItemsError) throw insertQuoteItemsError
      return {
        success: true,
        quote: { id: quoteId, created_at: quoteResult.created_at, status: quoteResult.status, total: quoteResult.total }
      }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  },
  async updateQuote(quote: Quote): Promise<{ success: boolean; quote?: Quote; error?: string }> {
    try {
      if (!quote.id) {
        throw new Error('La cotización debe tener un ID para ser actualizada.')
      }

      // 1. Actualizar la cotización principal
      const { data: updatedQuote, error: updateQuoteError } = await supabase
        .from('quotes')
        .update({
          customer_id: quote.customer_id,
          total: quote.total,
          status: quote.status
        })
        .eq('id', quote.id)
        .select()
        .single()

      if (updateQuoteError) throw updateQuoteError

      // 2. Eliminar los ítems existentes de la cotización
      const { error: deleteItemsError } = await supabase.from('quote_items').delete().eq('quote_id', quote.id)

      if (deleteItemsError) throw deleteItemsError

      // 3. Insertar los nuevos ítems
      const newItems = (quote.items ?? []).map((item: QuoteItem) => ({
        quote_id: quote.id,
        product_id: item.product?.id ?? null,
        description: `${item.product?.sku ?? ''} ${item.product?.description ?? ''}`.trim(),
        unit_price: item.product?.price ?? 0,
        required_quantity: item.requiredQuantity,
        total_quantity: item.totalQuantity,
        packages_required: item.packagesRequired,
        subtotal: item.subtotal,
        discount_type: item.discountType,
        original_subtotal: item.originalSubtotal,
        discount: item.discount
      }))

      const { error: insertItemsError } = await supabase.from('quote_items').insert(newItems)

      if (insertItemsError) throw insertItemsError

      return {
        success: true,
        quote: {
          id: quote.id,
          created_at: updatedQuote.created_at,
          total: updatedQuote.total,
          status: updatedQuote.status
        }
      }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  },
  async deleteQuote(quoteId: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (!quoteId) {
        throw new Error('El ID de la cotización es requerido para eliminarla.')
      }
      // 1. Eliminar los ítems de la cotización, supabase eliminara los ítems relacionados automáticamente
      const { error: deleteQuoteError } = await supabase.from('quotes').delete().eq('id', quoteId)

      if (deleteQuoteError) throw deleteQuoteError

      return { success: true }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  },
  async getQuoteItems(quoteId: number): Promise<{ success: boolean; items?: QuoteItemDB[]; error?: string }> {
    try {
      if (!quoteId) {
        throw new Error('El ID de la cotización es requerido para obtener los ítems.')
      }

      const { data: items, error } = await supabase.from('quote_items').select('*').eq('quote_id', quoteId)

      if (error) throw error

      return { success: true, items: items as QuoteItemDB[] }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }
}
