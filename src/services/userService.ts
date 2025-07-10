import { supabase } from '../lib/supabase'
import { EmailActions, Profile, SignInParams, SignUpParams } from '../types'

export const userService = {
  /**
   * Verifica si un correo electrónico ya está registrado en la base de datos.
   * @param email - El correo electrónico a verificar.
   * @returns `true` si el correo está registrado, `false` en caso contrario.
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_email_registered', { p_email: email })
    if (error) throw new Error(error.message || 'Error al consultar la base de datos.')
    return !!data
  },
  /**
   * Cambia la contraseña del usuario.
   * @param email - El correo electrónico del usuario.
   * @param password - La nueva contraseña del usuario.
   * @returns La respuesta del servidor al cambiar la contraseña.
   */
  async passwordChange(email: string, password: string) {
    console.log('Cambiando contraseña para el correo:', email)
    const response = await fetch('/api/account/password-change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) {
      throw new Error('Error al cambiar la contraseña')
    }

    this.sendEmail(email, 'password-changed')
    console.log('Contraseña cambiada y correo enviado a:', email)
    return await response.json()
  },
  /**
   * Envía un correo electrónico según la acción especificada.
   * @param email - El correo electrónico del usuario.
   * @param action - La acción para la cual se enviará el correo (create-account, verify-account, password-reset, password-changed, purchase-confirmation).
   * Las acciones deben estar definidas en el tipo `EmailActions`.
   * @returns La respuesta del servidor al enviar el correo.
   */
  async sendEmail(email: string, action: EmailActions, props?: Record<string, any>) {
    console.log('Enviando correo electrónico:', email, 'con acción:', action)

    const endPoints = {
      'create-account': '/api/mail/send-register-email',
      'verify-account': '/api/mail/send-welcome-email',
      'password-reset': '/api/mail/send-password-reset-email',
      'password-changed': '/api/mail/send-password-changed-email',
      'purchase-confirmation': '/api/mail/send-purchase-confirmation-email'
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

    //console.log('Endpoint para enviar correo:', endPoints[action])

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${endPoints[action]}`, {
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
  /**
   * Verifica el correo electrónico del usuario llamando a una función de Supabase.
   * @param email - El correo electrónico a verificar.
   */
  async VerifyEmail(email: string) {
    console.log('Verificando correo electrónico:', email)
    const { data, error } = await supabase.rpc('verify_email', { p_email: email })
    if (error) throw new Error(error.message || 'Error al consultar la base de datos.')
    console.log('Resultado de la verificación:', data)
  },
  /**
   * Registra un nuevo usuario y crea su perfil en la base de datos.
   * @param email - Correo electrónico del usuario.
   * @param password - Contraseña del usuario.
   * @param metadata - Metadatos adicionales del usuario.
   */
  async signUp({ email, password, metadata }: SignUpParams) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) throw error

    // Insertar datos en la tabla 'profiles' si el usuario se creó correctamente
    if (data.user) {
      const metadata = data.user.user_metadata

      const { error: insertError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: metadata?.full_name,
        phone: metadata?.phone || ''
      })
      if (insertError) throw insertError

      // Enviar correo de bienvenida
      await this.sendEmail(email, 'verify-account')
    }

    return data
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
