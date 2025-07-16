import { addToast } from '@heroui/react'
import { supabase } from '../lib/supabase'
import { User } from '../schemas/user.schema'
import { EmailActions, Profile, SignInParams } from '../types'

const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || 'http://localhost:8888'
export const userService = {
  /**
   * Verifica si un correo electrónico ya está registrado en la base de datos.
   * @param email - El correo electrónico a verificar.
   * @returns `true` si el correo está registrado, `false` en caso contrario.
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_email_registered', { check_email: email })
    if (error) throw new Error(error.message || 'Error al consultar la base de datos.')
    return !!data
  },
  /**
   * Resetea la contraseña del usuario desde el panel de administracion, copia el password al portapapels
   * @param email - El correo electrónico del usuario.
   * @param password - La nueva contraseña del usuario.
   * @returns La respuesta del servidor al cambiar la contraseña.
   */
  async passwordReset(user: User, password: string) {
    try {
      const response = await fetch(`${baseUrl}/.netlify/functions/user-password-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: user.id, password })
      })
      if (!response.ok) {
        throw new Error('Error al cambiar la contraseña')
      }

      //this.sendEmail(email, 'password-changed')
      console.log('Contraseña cambiada y correo enviado a:', user.email)

      // Copiar al portapapeles
      navigator.clipboard.writeText(password)

      addToast({
        title: 'Contraseña restablecida',
        description: `La nueva contraseña es: ${password}, se ha copiado al portapapeles.`,
        color: 'primary'
      })

      return await response.json()
    } catch (error) {
      console.error('[passwordReset]:', error)
      throw new Error('No se pudo cambiar la contraseña. Verifica los datos e intenta nuevamente.')
    }
  },
  async passwordResetMail(user: User, password: string) {
    try {
      const response = await fetch(`${baseUrl}/.netlify/functions/user-password-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: user.id, password })
      })
      if (!response.ok) {
        throw new Error('Error al cambiar la contraseña')
      }

      //this.sendEmail(email, 'password-changed')
      console.log('Contraseña cambiada y correo enviado a:', user.email)

      addToast({
        title: 'Contraseña restablecida',
        description: `Has cambiado tu contraseña exitosamente ya puedes usarla para iniciar sesión.`,
        color: 'primary',
        shouldShowTimeoutProgress: true,
        timeout: 5000
      })

      return await response.json()
    } catch (error) {
      console.error('[passwordResetMail]:', error)
      throw new Error('No se pudo cambiar la contraseña intentalo nuevamente.')
    }
  },
  async passwordChange(current_password: string, new_password: string): Promise<boolean> {
    try {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user?.email) {
        throw new Error('No hay sesión activa o no se pudo obtener el correo')
      }

      const email = session.user.email

      // Paso 1: Verificar contraseña actual reautenticando
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: current_password
      })

      if (signInError) {
        return false
      }

      // Paso 2: Cambiar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: new_password
      })

      if (updateError) {
        throw new Error('No se pudo actualizar la contraseña.')
      }

      addToast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido actualizada correctamente.',
        color: 'primary'
      })

      return true
    } catch (error) {
      console.error('[passwordChange]:', error)
      throw new Error('No se pudo cambiar la contraseña. Verifica los datos e intenta nuevamente.')
    }
  },
  /**
   * Envía un correo electrónico según la acción especificada.
   * @param email - El correo electrónico del usuario.
   * @param action - La acción para la cual se enviará el correo (create-account, verify-account, password-reset, password-changed, purchase-confirmation).
   * Las acciones deben estar definidas en el tipo `EmailActions`.
   * @returns La respuesta del servidor al enviar el correo.
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendEmail(email: string, action: EmailActions, props?: Record<string, any>) {
    console.log('Enviando correo electrónico:', email, 'con acción:', action)
    const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || 'http://localhost:8888'

    const endPoints = {
      'password-reset': `send-reset-password-email`,
      'password-changed': 'send-password-changed-email'
    }

    if (!endPoints[action]) {
      throw new Error('Acción no válida para enviar correo electrónico')
    }

    // Si se pasan propiedades adicionales, las incluimos en el cuerpo del mensaje
    let bodyProps = { email }
    if (props) {
      console.log('Propiedades adicionales para el correo:', props)
      bodyProps = { email, ...props }
    }

    const response = await fetch(`${baseUrl}/.netlify/functions/${endPoints[action]}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyProps)
    })

    if (!response.ok) {
      throw new Error('Error al enviar el correo electrónico')
    }

    return await response.json()
  },
  async verifyResetPasswordToken(token: string): Promise<{ verifiedUser?: User; error?: string }> {
    const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || 'http://localhost:8888'

    try {
      const response = await fetch(`${baseUrl}/.netlify/functions/verify-reset-password-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        const errorText = await response.text()

        if (errorText.includes('expired')) {
          return { error: 'El token ha expirado. Por favor, solicita un nuevo restablecimiento de contraseña.' }
        } else if (errorText.includes('invalid')) {
          return { error: 'Token inválido. Por favor, verifica el enlace o solicita un nuevo restablecimiento de contraseña.' }
        } else {
          return { error: 'Error al verificar el token. Por favor, intenta nuevamente más tarde.' }
        }
      }
      const data = await response.json()
      return {
        verifiedUser: data as User
      }
    } catch (error) {
      console.error('Excepción al verificar el token:', error)
      return {
        error: 'Ocurrió un error inesperado al verificar el token. Revisa tu conexión o intenta más tarde.'
      }
    }
  },

  async createUser(user: User) {
    try {
      const response = await fetch(`${baseUrl}/.netlify/functions/user-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          full_name: user.full_name
        })
      })

      if (!response.ok) {
        throw new Error('Error al crear el usuario en en la base')
      }
      const { user: userCreated }: { user: User } = await response.json()

      // Insertar perfil en la tabla 'user_profiles'
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: userCreated.id,
        full_name: user.full_name,
        phone: user.phone || '',
        email: userCreated.email,
        role: user.role
      })

      if (profileError) throw profileError
    } catch (error) {
      console.error('Error al crear el usuario:', error)
      throw new Error('No se pudo crear el usuario. Verifica los datos e intenta nuevamente.')
    }
  },
  async updateUser(user: User) {
    try {
      const response = await fetch(`${baseUrl}/.netlify/functions/user-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario en la base')
      }

      const { user: updatedUser }: { user: User } = await response.json()

      // Actualizar perfil en la tabla 'user_profiles'
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          full_name: user.full_name,
          phone: user.phone || '',
          email: updatedUser.email,
          role: user.role
        })
        .eq('id', updatedUser.id)

      if (profileError) throw profileError

      return updatedUser
    } catch (error) {
      console.error('Error al actualizar el usuario:', error)
      throw new Error('No se pudo actualizar el usuario. Verifica los datos e intenta nuevamente.')
    }
  },
  async updateSettings(user: User, settings: { email_notifications?: boolean; quotes_expire?: number }) {
    try {
      // Actualizar ajustes en la tabla 'user_profiles'
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          email_notifications: settings.email_notifications,
          quotes_expire: settings.quotes_expire
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      addToast({
        title: 'Ajustes actualizados',
        description: 'Los ajustes del usuario se han actualizado correctamente.',
        color: 'primary'
      })
    } catch (error) {
      addToast({
        title: 'Error al actualizar ajustes',
        description: 'No se pudieron actualizar los ajustes del usuario. Verifica los datos e intenta nuevamente.',
        color: 'danger'
      })
      console.error('Error al actualizar los ajustes del usuario:', error)
      throw new Error('No se pudieron actualizar los ajustes del usuario. Verifica los datos e intenta nuevamente.')
    }
  },
  async deleteUser(userId: string) {
    try {
      const response = await fetch(`${baseUrl}/.netlify/functions/user-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: userId })
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el usuario en la base')
      }

      // Eliminar perfil de la tabla 'user_profiles'
      const { error: profileError } = await supabase.from('user_profiles').delete().eq('id', userId)
      if (profileError) throw profileError

      return { success: true }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error)
      throw new Error('No se pudo eliminar el usuario. Verifica los datos e intenta nuevamente.')
    }
  },

  async setUserActive(user: User, isActive: boolean) {
    //Si el usuario es administrador y es el único administrador activo, no se puede desactivar
    if (
      user.role === 'admin' &&
      (await supabase.from('user_profiles').select('id').eq('role', 'admin').eq('is_active', true).limit(2)).data?.length === 1 &&
      !isActive
    ) {
      addToast({
        title: 'No se puede desactivar',
        description: 'Debe haber al menos un administrador activo en el sistema.',
        color: 'danger',
        shouldShowTimeoutProgress: true,
        timeout: 8000
      })
      throw new Error('No se puede desactivar al único administrador activo')
    }

    try {
      const response = await fetch(`${baseUrl}/.netlify/functions/user-set-ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: user.id, is_active: isActive })
      })

      if (!response.ok) {
        throw new Error('Error al cambiar el estado en la base ')
      }

      // Actualizar el estado en la tabla 'user_profiles'
      const { error: profileError } = await supabase.from('user_profiles').update({ is_active: isActive }).eq('id', user.id)

      if (profileError) throw profileError

      //return data
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error)
      throw new Error('No se pudo actualizar el estado del usuario. Verifica los datos e intenta nuevamente.')
    }
  },

  /**
   * Inicia sesión un usuario con su correo electrónico y contraseña.
   * @param email - Correo electrónico del usuario.
   * @param password - Contraseña del usuario.
   */
  async signIn({ email, password }: SignInParams) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  async getUserProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single()

    if (error || !data) throw new Error('No se pudo obtener el perfil del usuario.')
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  }
}
