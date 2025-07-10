import { z } from 'zod'

export const createUser = z.object({
  phone: z.string().min(10, { message: 'Número de teléfono inválido' }),
  email: z.string().email({ message: 'Email inválido' }),
  terms: z.boolean().refine((val) => val, {
    message: 'Debes aceptar los términos y condiciones'
  })
})
export type CreateUser = z.infer<typeof createUser>

export const confirmUser = z
  .object({
    phone: z.string().min(10, { message: 'Número de teléfono inválido' }),
    email: z.string().email(),
    name: z.string().min(5).max(100),
    password: z.string().min(8, { message: 'Mínimo 8 caracteres' }).max(100),
    password2: z.string().nonempty({ message: 'Debes confirmar tu contraseña' }),
    terms: z.boolean().refine((val) => val, {
      message: 'Debes aceptar los términos y condiciones'
    })
  })
  .refine((data) => data.password === data.password2, {
    message: 'Las contraseñas no coinciden',
    path: ['password2']
  })

export type ConfirmUser = z.infer<typeof confirmUser>

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

export const verifyEmail = z.object({
  email: z.string().email({ message: 'El correo electrónico no es válido' })
})
export type VerifyEmail = z.infer<typeof verifyEmail>

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
