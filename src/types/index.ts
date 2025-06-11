export interface Cliente {
  id: string
  nombre: string
  contacto: string
  direccion: string
  notas?: string
}

export type UserRole = 'admin' | 'staff'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
}

export type MaterialCategoria = 'Pisos' | 'Paredes' | 'Techos' | 'Cocina' | 'Baño' | 'Persianas'
export type UnidadCompra = 'metro' | 'caja' | 'pieza' | 'rollo'
export type UnidadVenta = 'metro cuadrado' | 'metro lineal'

export interface Material {
  id: string
  nombre: string
  codigo: string
  precio: number
  unidadCompra: UnidadCompra
  unidadVenta: UnidadVenta
  categoria: MaterialCategoria
  metrosPorUnidad?: number
  proveedor: string
}

export interface ItemCotizacion {
  id: string
  materialId: string
  metrosCuadrados: number
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export type CotizacionStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'finalizada'

export interface Cotizacion {
  id: string
  clienteId: string
  fecha: string
  items: ItemCotizacion[]
  subtotal: number
  iva: number
  descuento: number
  total: number
  status: CotizacionStatus
}

export interface Product {
  id: number
  created_at: string
  sku?: string
  description: string
  provider: number
  package_unit?: number
  measurement_unit: string
  wholesale_price?: number
  public_price?: number
  category: number
  spec?: string
  price?: number
  utility?: number
  provider_name: string
  category_description: string
}

export interface Customer {
  id: number
  created_at: string
  customer_type: 'individual' | 'business'
  name: string
  rfc?: string
  phone?: string
  email?: string
  address?: string
  state?: string
  city?: string
  postalcode?: string
  notes?: string
  status: string
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
