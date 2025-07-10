import { Handler } from '@netlify/functions'
import { supabaseAdmin } from '../lib/supabase'

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    const { id, email, password, full_name } = JSON.parse(event.body || '{}')

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID de usuario es requerido' })
      }
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      ...(email && { email }),
      ...(password && { password }),
      user_metadata: full_name ? { full_name } : undefined
    })

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user: data.user })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error del servidor: ${err}` })
    }
  }
}

export { handler }
