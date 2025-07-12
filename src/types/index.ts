export type uiColors = 'primary' | 'secondary' | 'success' | 'danger' | 'default' | 'warning'

export interface Cliente {
  id: string
  nombre: string
  contacto: string
  direccion: string
  notas?: string
}

export type UserRole = 'admin' | 'staff'

export type Period = 'day' | 'week' | 'month'

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

export interface QuoteLogItem {
  id: number
  quote_id: number
  action: string
  user_id?: number
  user_agent: string
  ip_address: string
  created_at: string
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
  access_token?: string | null // Para autenticación en API
  history?: QuoteLogItem[] // Historial de acciones
  expiration_date?: string | null // Fecha de expiración
  daysToExpire?: number // Días restantes para expirar
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'open' | 'archived' | 'restored'

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

export type EmailTemplate = 'register' | 'welcome' | 'purchaseConfirmation' | 'passwordReset' | 'passwordChangedConfirmation'
export type EmailActions = 'create-account' | 'verify-account' | 'password-reset' | 'password-changed' | 'purchase-confirmation'

export type EmailProps = {
  to: string
  subject: string
  template: EmailTemplate
  props: any
}

export interface SignUpParams {
  email: string
  password: string
  terms?: boolean | true

  metadata: {
    full_name: string
    phone: string
    role?: 'admin' | 'staff'
  }
}

export interface SignInParams {
  email: string
  password: string
}

export interface Profile {
  id: string
  full_name: string
  phone: string
  role: 'admin' | 'staff'
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

export const userRoles = [
  { key: 'admin', label: 'Administrador', color: 'bg-blue-500' },
  { key: 'staff', label: 'Staff', color: 'bg-green-500' }
]

export const quoteStatus = [
  { key: 'open', label: 'abierta', color: 'primary' },
  { key: 'sent', label: 'enviada', color: 'secondary' },
  { key: 'accepted', label: 'aceptada', color: 'success' },
  { key: 'rejected', label: 'rechazada', color: 'danger' },
  { key: 'expired', label: 'expirada', color: 'default' },
  { key: 'archived', label: 'archivada', color: 'danger' }
]

export const quoteActions = [
  { key: 'created', label: 'Creada', icon: 'save', color: 'primary' },
  { key: 'sent_mail', label: 'Enviada por Mail ', icon: 'mail-plus', color: 'secondary' },
  { key: 'sent_whatsapp', label: 'Enviada por WhatsApp ', icon: 'mail-plus', color: 'secondary' },
  { key: 'restored', label: 'Restaurar', icon: 'archive-restore', color: 'primary' },
  { key: 'updated', label: 'Actualización', icon: 'archive-restore', color: 'primary' },
  { key: 'accepted', label: 'Aceptada', icon: 'check-circle', color: 'success' },
  { key: 'rejected', label: 'Rechazada', icon: 'x-circle', color: 'danger' },
  { key: 'expired', label: 'Expirada', icon: 'clock', color: 'default' },
  { key: 'archived', label: 'Archivada', icon: 'archive', color: 'danger' },
  { key: 'opened', label: 'Vista', icon: 'eye', color: 'success' },
  { key: 'downloaded', label: 'Descargada', icon: 'file-down', color: 'secondary' },
  { key: 'cloned', label: 'Clonada', icon: 'file-down', color: 'secondary' }
]
