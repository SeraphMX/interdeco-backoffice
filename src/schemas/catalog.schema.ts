import { z } from 'zod'

export const categorySchema = z.object({
  description: z.string().min(1, 'Obligatorio'),
  color: z.string().min(1, 'El color es obligatorio')
})

export const providerSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio')
})

export const measureUnitSchema = z.object({
  key: z.string().min(1, 'La clave es obligatoria'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  plural: z.string().min(1, 'El plural es obligatorio')
})

export type Category = z.infer<typeof categorySchema>
export type Provider = z.infer<typeof providerSchema>
export type MeasureUnit = z.infer<typeof measureUnitSchema>
