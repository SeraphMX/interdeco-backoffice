export type uiColors = 'primary' | 'secondary' | 'success' | 'danger' | 'default' | 'warning'

export interface Category {
  id: number
  description: string
  color: string
}
export interface Provider {
  id: number
  name: string
}

export interface Cliente {
  id: string
  nombre: string
  contacto: string
  direccion: string
  notas?: string
}

export interface MeasureUnit {
  key: string
  name: string
  plural: string
}

export type UserRole = 'admin' | 'staff'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
}

export interface QuoteItem {
  product_id?: number // Para relación con DB
  product?: Product // Para datos completos (undefined cuando no está cargado)
  requiredQuantity: number
  totalQuantity: number
  packagesRequired?: number
  originalSubtotal?: number
  subtotal: number
  discountType?: 'percentage' | 'fixed'
  discount?: number
}
export interface QuoteItemDB {
  id: number
  quote_id: number
  product_id: number
  description: string
  required_quantity: number
  packages_required?: number

  total_quantity: number
  subtotal: number
  original_subtotal?: number
  discount_type?: 'percentage' | 'fixed'
  discount?: number
}

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
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'open' | 'archived'

export type CotizacionStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'finalizada'

export interface Cotizacion {
  id: string
  clienteId: string
  fecha: string
  items: QuoteItem[]
  subtotal: number
  iva: number
  descuento: number
  total: number
  status: CotizacionStatus
}

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

export interface Customer {
  id?: number
  created_at?: string
  customer_type: 'individual' | 'business'
  name: string
  rfc?: string
  phone: string
  email?: string
  address?: string
  state?: string
  city?: string
  postalcode?: string
  notes?: string
  status?: string
}

export const estadosMexico = [
  { key: '01', label: 'Aguascalientes' },
  { key: '02', label: 'Baja California' },
  { key: '03', label: 'Baja California Sur' },
  { key: '04', label: 'Campeche' },
  { key: '05', label: 'Chiapas' },
  { key: '06', label: 'Chihuahua' },
  { key: '07', label: 'Coahuila' },
  { key: '08', label: 'Colima' },
  { key: '09', label: 'Ciudad de México' },
  { key: '10', label: 'Durango' },
  { key: '11', label: 'Estado de México' },
  { key: '12', label: 'Guanajuato' },
  { key: '13', label: 'Guerrero' },
  { key: '14', label: 'Hidalgo' },
  { key: '15', label: 'Jalisco' },
  { key: '16', label: 'Michoacán' },
  { key: '17', label: 'Morelos' },
  { key: '18', label: 'Nayarit' },
  { key: '19', label: 'Nuevo León' },
  { key: '20', label: 'Oaxaca' },
  { key: '21', label: 'Puebla' },
  { key: '22', label: 'Querétaro' },
  { key: '23', label: 'Quintana Roo' },
  { key: '24', label: 'San Luis Potosí' },
  { key: '25', label: 'Sinaloa' },
  { key: '26', label: 'Sonora' },
  { key: '27', label: 'Tabasco' },
  { key: '28', label: 'Tamaulipas' },
  { key: '29', label: 'Tlaxcala' },
  { key: '30', label: 'Veracruz' },
  { key: '31', label: 'Yucatán' },
  { key: '32', label: 'Zacatecas' }
]

export const customerStatus = [
  { key: 'inactive', label: 'Inactivo', color: 'bg-gray-300' },
  { key: 'new', label: 'Nuevo', color: 'bg-green-300' },
  { key: 'firsttime', label: 'Primera compra', color: 'bg-blue-300' },
  { key: 'returning', label: 'Ocasional', color: 'bg-yellow-300' },
  { key: 'recent', label: 'Reciente', color: 'bg-purple-300' },
  { key: 'frequent', label: 'Frecuente', color: 'bg-orange-300' }
]

export const measureUnits = [
  { key: 'M2', label: 'Metro cuadrado', plural: 'Metros cuadrados' },
  { key: 'ML', label: 'Metro lineal', plural: 'Metros lineales' },
  { key: 'KG', label: 'Kilogramo', plural: 'Kilogramos' },
  { key: 'L', label: 'Litro', plural: 'Litros' },
  { key: 'PZ', label: 'Pieza', plural: 'Piezas' },
  { key: 'CJ', label: 'Caja', plural: 'Cajas' },
  { key: 'BG', label: 'Bolsa', plural: 'Bolsas' }
]

export const quoteStatus = [
  { key: 'open', label: 'abierta', color: 'primary' },
  { key: 'sent', label: 'enviada', color: 'secondary' },
  { key: 'accepted', label: 'aceptada', color: 'success' },
  { key: 'rejected', label: 'rechazada', color: 'danger' },
  { key: 'expired', label: 'expirada', color: 'default' },
  { key: 'archived', label: 'archivada', color: 'danger' }
]
