import { z } from 'zod'

export const createUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' }).max(100).optional(),
  phone: z.string().min(10, { message: 'Número de teléfono inválido' }).optional(),
  full_name: z.string().min(5, { message: 'El nombre es obligatorio' }).max(100),
  role: z.enum(['admin', 'staff'], {
    errorMap: () => ({ message: 'Selecciona un tipo de usuario' })
  }),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string().optional(),
  email_notifications: z.boolean().optional(),
  quotes_expire: z.number().optional()
})

export const profileUserSchema = z.object({
  full_name: z.string().min(5, { message: 'El nombre es obligatorio' }).max(100),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(10, { message: 'Número de teléfono inválido' }).optional()
})

export const profileResetPasswordSchema = z
  .object({
    current_password: z.string().min(8, { message: 'Mínimo 8 caracteres' }).max(100),
    new_password: z.string().min(8, { message: 'Mínimo 8 caracteres' }).max(100),
    new_password2: z.string().nonempty({ message: 'Debes confirmar tu contraseña' })
  })
  .refine((data) => data.new_password === data.new_password2, {
    message: 'Las contraseñas no coinciden'
  })

export type User = z.infer<typeof createUserSchema>

export const completeUser = z
  .object({
    name: z.string().min(5).max(100),
    password: z.string().min(8, { message: 'Mínimo 8 caracteres' }).max(100),
    password2: z.string().nonempty({ message: 'Debes confirmar tu contraseña' })
  })
  .refine((data) => data.password === data.password2, {
    message: 'Las contraseñas no coinciden',
    path: ['password2']
  })

export const loginUserForm = z.object({
  email: z.string().min(1, { message: 'El email es requerido' }).email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' }).min(8, { message: 'Mínimo 8 caracteres' }).max(100)
})
export type LoginUserForm = z.infer<typeof loginUserForm>

export const resetPasswordMail = z
  .object({
    email: z
      .string({ required_error: 'El correo electrónico es requerido' })
      .min(1, { message: 'El correo electrónico es requerido' })
      .email({ message: 'El correo electrónico no es válido' }),
    password: z.string().min(8, { message: 'Mínimo 8 caracteres' }).max(100),
    password2: z.string().nonempty({ message: 'Debes confirmar tu contraseña' })
  })
  .refine((data) => data.password === data.password2, {
    message: 'Las contraseñas no coinciden',
    path: ['password2']
  })

export type VerifyEmail = z.infer<typeof resetPasswordMail>

export const verifyPhone = z.object({
  phone: z.string().min(10, { message: 'Número de teléfono inválido' }).regex(/^\d+$/, { message: 'Número de teléfono inválido' })
})
export type VerifyPhone = z.infer<typeof verifyPhone>

export const resetPassword = z
  .object({
    password: z.string().min(8, { message: 'Mínimo 8 caracteres' }).max(100),
    password2: z.string().nonempty({ message: 'Debes confirmar tu contraseña' })
  })
  .refine((data) => data.password === data.password2, {
    message: 'Las contraseñas no coinciden',
    path: ['password2']
  })
