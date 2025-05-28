import { z } from 'zod'

export const productSchema = z.object({
  id: z.coerce.number().nonnegative(),
  sku: z.string().min(1, 'El SKU es obligatorio'),
  description: z.string().optional(),
  provider: z.coerce.number().nonnegative(),
  package_unit: z.coerce.number().nonnegative(),
  measurement_unit: z.string().min(1, 'La unidad de medida es requerida'),
  wholesale_price: z.coerce.number().nonnegative(),
  public_price: z.coerce.number().nonnegative().positive(),
  category: z.coerce.number().nonnegative(),
  spec: z.string().optional()
})

export type ProductFormData = z.infer<typeof productSchema>
