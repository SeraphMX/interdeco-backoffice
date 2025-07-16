import { Handler } from '@netlify/functions'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Método no permitido'
    }
  }

  let token: string | undefined

  try {
    const body = JSON.parse(event.body || '{}')
    token = body.token
  } catch {
    return {
      statusCode: 400,
      body: 'Cuerpo inválido'
    }
  }

  if (!token) {
    return {
      statusCode: 400,
      body: 'Token no proporcionado'
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return {
      statusCode: 200,
      body: JSON.stringify(decoded)
    }
  } catch (err) {
    console.log('Error al verificar el token:', err.message)
    return {
      statusCode: 401,
      body: 'Token inválido o expirado: ' + (err instanceof Error ? err.message : '')
    }
  }
}

export { handler }
