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
    const { id, is_active } = JSON.parse(event.body || '{}')

    console.log('Actualizando estado de usuario:', { id, is_active })

    if (!id || typeof is_active !== 'boolean') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Parámetros inválidos: se requiere userId y banned (boolean)' })
      }
    }

    console.log('Cerrando sesión del usuario:', id)

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      ban_duration: is_active ? 'none' : '9999h' // Baneado por 30 días si banned es true
    })

    if (error) {
      console.log('Error al actualizar el usuario:', error.message)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    console.log('Usuario actualizado:', { id, is_active })
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Usuario ${is_active ? 'baneado' : 'desbaneado'}`, user: data })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor', details: err.message })
    }
  }
}

export { handler }
