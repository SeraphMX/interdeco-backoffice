import { Handler } from '@netlify/functions'
import { supabaseAdmin } from '../lib/supabase'

const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: 'Método no permitido'
      }
    }

    const { email, password, full_name } = JSON.parse(event.body || '{}')

    if (!email || !password) {
      return {
        statusCode: 400,
        body: 'Email y password son requeridos'
      }
    }

    console.log('Creando usuario:', { email, full_name })

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name
      },
      email_confirm: true
    })

    if (error) {
      console.error('Error al crear el usuario:', error.message)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user: data.user })
    }
  } catch (err) {
    console.error('Excepción no controlada:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error inesperado en el servidor' })
    }
  }
}

export { handler }
