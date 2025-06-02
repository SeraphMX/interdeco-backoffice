import { z } from 'zod'

export const productSchema = z.object({
  id: z.coerce.number().nonnegative(),
  sku: z.string().min(1, 'El SKU es obligatorio'),
  description: z.preprocess((val) => {
    if (val === '' || val === null || (typeof val === 'string' && val.trim() === '')) {
      return undefined
    }
    return val
  }, z.string().optional()),
  provider: z.coerce.number().nonnegative(),
  package_unit: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().nonnegative()).default(1),
  measurement_unit: z.string().min(1, 'La unidad de medida es requerida'),
  wholesale_price: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().nonnegative()).optional(),
  public_price: z.coerce.number().nonnegative().positive(),
  price: z.coerce.number().nonnegative().positive(),
  utility: z.coerce.number().nonnegative().positive(),
  category: z.coerce.number().nonnegative(),
  spec: z.preprocess((val) => {
    if (val === null || val === '') return undefined
    if (typeof val === 'string' && val.trim() === '') return undefined
    return val
  }, z.string().optional())
})

export type ProductFormData = z.infer<typeof productSchema>
