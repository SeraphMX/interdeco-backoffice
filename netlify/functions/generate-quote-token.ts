import { Handler } from '@netlify/functions'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'

const JWT_SECRET = process.env.JWT_SECRET!

export interface Quote {
  id?: number | null
  customer_id?: number | null
  customer_name?: string | null
  created_at?: string | null
  last_updated?: string | null
  items?: QuoteItem[]
  total_items?: number | null
  total: number
  status: QuoteStatus
  acces_token?: string // Para autenticación en API
}

export interface QuoteItem {
  product_id?: number // Para relación con DB
  product?: Product | undefined // Para datos completos (undefined cuando no está cargado)
  requiredQuantity: number
  totalQuantity: number
  packagesRequired?: number
  originalSubtotal?: number
  subtotal: number
  discountType?: 'percentage' | 'fixed'
  discount?: number
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'open' | 'archived'

export interface Product {
  sku: string
  description: string
  provider: number
  category: number
  measurement_unit: string
  package_unit: number
  price: number // Cambiado a requerido
  utility: number // Cambiado a requerido
  spec: string
  // Opcionales
  id?: number
  created_at?: string
  public_price?: number
  provider_name?: string
  category_description?: string
  is_active?: boolean
}

const handler: Handler = async (quoteData) => {
  const body = JSON.parse(quoteData.body || '{}')
  const quote = body.quote as Quote

  console.log('Received data:', { body })

  if (!quote || !quote.id) {
    return {
      statusCode: 400,
      body: 'Faltan datos'
    }
  }

  const token = jwt.sign({ quote_id: quote.id }, JWT_SECRET, { expiresIn: body.expiresIn || '7d' })

  const decoded = jwt.decode(token) as { exp?: number } | null
  if (!decoded?.exp) {
    return { statusCode: 500, body: 'No se pudo calcular la expiración del token' }
  }

  const expiresAtIso = new Date(decoded.exp * 1000).toISOString()

  // Guardar el token en la cotización
  await supabase.from('quotes').update({ access_token: token, expiration_date: expiresAtIso }).eq('id', quote.id)

  return {
    statusCode: 200,
    body: JSON.stringify({ access_token: token })
  }
}

export { handler }
