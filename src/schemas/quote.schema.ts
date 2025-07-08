import { z } from 'zod'

export const sendQuoteMailSchema = z.object({
  email: z.string().min(1, 'El correo electrónico es obligatorio').email('Correo electrónico inválido')
})
export const sendQuoteWhatsappSchema = z.object({
  phone: z.string().min(1, 'El teléfono es obligatorio').regex(/^\d+$/, 'Teléfono inválido')
})
