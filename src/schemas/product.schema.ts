import { z } from 'zod'

export const productSchema = z.object({
  sku: z.string().min(1, 'El SKU es obligatorio'),
  description: z.preprocess((val) => {
    if (val === '' || val === null || (typeof val === 'string' && val.trim() === '')) {
      return undefined
    }
    return val
  }, z.string().optional()),
  provider: z.coerce.number().nonnegative(),
  package_unit: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().nonnegative().default(1)).optional(),
  measurement_unit: z.string().min(1, 'La unidad de medida es requerida'),
  price: z.coerce.number().nonnegative().positive(),
  utility: z.coerce.number().nonnegative().positive(),
  category: z.coerce.number().nonnegative(),
  spec: z.preprocess((val) => {
    if (val === null || val === '') return undefined
    if (typeof val === 'string' && val.trim() === '') return undefined
    return val
  }, z.string().optional())
})

export const productSchemaUpdate = productSchema.extend({
  id: z.coerce.number().nonnegative().optional()
})

export const productSchemaAdd = productSchema.extend({
  description: z.string().min(5, 'La descripción es obligatoria'),
  spec: z.string().min(3, 'Las especificaciones son obligatorias'),
  category: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z
      .number({
        required_error: 'La categoría es requerida',
        invalid_type_error: 'Selecciona una categoría'
      })
      .nonnegative()
  ),
  provider: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z
      .number({
        required_error: 'El proveedor es requerido',
        invalid_type_error: 'Selecciona un proveedor'
      })
      .nonnegative()
  )
})

// Tipos derivados
export type ProductFormData = z.infer<typeof productSchema>
export type ProductFormDataUpdate = z.infer<typeof productSchemaUpdate>

export type ProductFormDataClean = {
  sku: string
  description?: string
  provider: number
  package_unit?: number
  measurement_unit: string
  price: number
  utility: number
  category: number
  spec?: string
}

export type ProductFormDataUpdateClean = ProductFormDataClean & {
  id?: number
}
