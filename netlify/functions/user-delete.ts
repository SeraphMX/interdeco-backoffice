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
    const { id } = JSON.parse(event.body || '{}')

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Se requiere el ID del usuario' })
      }
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Usuario eliminado' })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error del servidor: ${err}` })
    }
  }
}

export { handler }
