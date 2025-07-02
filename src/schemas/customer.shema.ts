import { z } from 'zod'

export const customerSchema = z.object({
  id: z.coerce.number().nonnegative().optional(),
  customer_type: z.enum(['individual', 'business'], {
    errorMap: () => ({ message: 'Selecciona un tipo de cliente' })
  }),
  name: z.string().min(1, 'El nombre del cliente es obligatorio'),
  rfc: z.string().optional(),
  phone: z.string().min(1, '10 dígitos, sin espacios ni guiones').regex(/^\d+$/, 'El teléfono solo debe contener dígitos'),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalcode: z.string().optional(),
  notes: z.string().optional()
})

export const customerSchemaUpdate = customerSchema.extend({
  id: z.coerce.number().nonnegative().optional()
})

export type CustomerFormData = z.infer<typeof customerSchema>
export type CustomerFormDataUpdate = z.infer<typeof customerSchemaUpdate>
