import { addToast } from '@heroui/react'
import { clone } from 'lodash'
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
  async saveQuote(quote: Quote): Promise<{ success: boolean; quote?: Quote; error?: string; url?: string }> {
    try {
      // 1. Insertar la cotización principal
      const { data: quoteResult, error: insertQuoteError } = await supabase
        .from('quotes')
        .insert({
          customer_id: quote.customer_id || null,
          total: quote.total,
          status: quote.status || 'open',
          access_token: null
        })
        .select()
        .single()

      if (insertQuoteError) throw insertQuoteError
      const quoteId = quoteResult?.id
      if (!quoteId) throw new Error('No se obtuvo ID de cotización')

      // 2. Insertar items
      const quoteItems = (quote.items ?? []).map((item) => ({
        quote_id: quoteId,
        product_id: item.product_id || item.product?.id || null,
        description: item.product ? `${item.product.sku ?? ''} ${item.product.description ?? ''}`.trim() : '',
        unit_price: item.product?.price ?? 0,
        required_quantity: item.requiredQuantity,
        total_quantity: item.totalQuantity,
        packages_required: item.packagesRequired ?? 1,
        subtotal: item.subtotal,
        discount_type: item.discountType ?? 'percentage',
        original_subtotal: item.originalSubtotal ?? item.subtotal,
        discount: item.discount ?? 0
      }))

      const { error: insertItemsError } = await supabase.from('quote_items').insert(quoteItems)
      if (insertItemsError) throw insertItemsError

      // 3. Llamar a la función Netlify que genera el token
      const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || 'http://localhost:8888'

      console.log('Base URL for Netlify function:', baseUrl)

      const response = await fetch(`${baseUrl}/.netlify/functions/generate-quote-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote: quoteResult
        })
      })

      console.log('Response from Netlify function:', response)

      if (!response.ok) {
        throw new Error('Error al generar token en función Netlify')
      }

      const { access_token } = await response.json()

      return {
        success: true,
        quote: { id: quoteId, ...quoteResult, access_token }
      }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  },

  async cloneQuote(quote: Quote): Promise<{ success: boolean; quote?: Quote; error?: string }> {
    try {
      if (!quote.id) {
        throw new Error('La cotización debe tener un ID para ser clonada.')
      }

      // Obtener los ítems actuales de la cotización
      const itemsResult = await this.getQuoteItems(quote.id)
      if (!itemsResult.success) {
        throw new Error(itemsResult.error || 'Error al obtener los ítems de la cotización')
      }

      // Mapear los items al formato QuoteItem
      const mappedItems: QuoteItem[] =
        itemsResult.items?.map((item) => ({
          product_id: item.product_id || undefined,
          product: undefined, // Dejamos product como undefined intencionalmente
          requiredQuantity: item.required_quantity,
          totalQuantity: item.total_quantity,
          packagesRequired: item.packages_required,
          originalSubtotal: item.original_subtotal,
          subtotal: item.subtotal,
          discountType: item.discount_type as 'percentage' | 'fixed',
          discount: item.discount
        })) || []

      // Crear la cotización clonada
      const clonedQuote: Quote = {
        ...clone(quote),
        id: undefined,
        status: 'open',
        created_at: undefined,
        last_updated: undefined,
        items: mappedItems
      }

      // Guardar la cotización clonada
      const result = await this.saveQuote(clonedQuote)
      if (!result.success) {
        throw new Error(result.error || 'Error al guardar la cotización clonada.')
      }

      return { success: true, quote: result.quote }
    } catch (e) {
      addToast({
        title: 'Error al guardar',
        description: 'Hubo un error al guardar la cotización. Inténtalo de nuevo.',
        color: 'danger'
      })
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
          last_updated: updatedQuote.last_updated,
          total: updatedQuote.total,
          status: updatedQuote.status
        }
      }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  },
  async deleteQuote(quote: Quote): Promise<{ success: boolean; error?: string }> {
    try {
      if (!quote) {
        throw new Error('La cotización es requerida para eliminarla.')
      }
      // 1. Eliminar los ítems de la cotización, supabase eliminara los ítems relacionados automáticamente
      const { error: deleteQuoteError } = await supabase.from('quotes').delete().eq('id', quote.id)

      if (deleteQuoteError) throw deleteQuoteError

      setTimeout(() => {
        addToast({
          title: 'Cotización eliminada',
          description: 'La cotización ha sido eliminada correctamente.',
          color: 'primary'
        })
      }, 1000) // Esperar un segundo para asegurar que la eliminación se procese

      return { success: true }
    } catch (e) {
      addToast({
        title: 'Error al eliminar',
        description: 'Hubo un error al eliminar la cotización. Inténtalo de nuevo.',
        color: 'danger'
      })
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
  },
  async setQuoteStatus(quoteId: number, status: string): Promise<{ success: boolean; quote?: Quote; error?: string }> {
    try {
      if (!quoteId) {
        throw new Error('El ID de la cotización es requerido para actualizar el estado.')
      }

      const { data: updatedQuote, error } = await supabase.from('quotes').update({ status }).eq('id', quoteId).select().single()

      if (error) throw error

      return {
        success: true,
        quote: {
          id: updatedQuote.id,
          created_at: updatedQuote.created_at,
          last_updated: updatedQuote.last_updated,
          total: updatedQuote.total,
          status: updatedQuote.status
        }
      }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  },
  async sendQuoteEmail(email: string, quote: Quote): Promise<{ success: boolean; error?: string }> {
    try {
      if (!quote || !email) {
        throw new Error('El ID de la cotización y el correo electrónico son requeridos para enviar la cotización.')
      }

      const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || 'http://localhost:8888'

      const response = await fetch(`${baseUrl}/.netlify/functions/send-quote-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, quote })
      })

      if (!response.ok) {
        throw new Error('Error al enviar el correo electrónico de la cotización.')
      }

      addToast({
        title: 'Correo enviado',
        description: 'La cotización ha sido enviada correctamente por correo electrónico.',
        color: 'primary'
      })

      return { success: true }
    } catch (e) {
      addToast({
        title: 'Error al enviar correo',
        description: 'Hubo un error al enviar la cotización por correo electrónico. Inténtalo de nuevo.',
        color: 'danger'
      })
      return { success: false, error: (e as Error).message }
    }
  }
}
