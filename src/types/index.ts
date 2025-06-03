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
