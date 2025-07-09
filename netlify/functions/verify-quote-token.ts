// netlify/functions/verify-quote-token.ts
import { Handler } from '@netlify/functions'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'

const JWT_SECRET = process.env.JWT_SECRET!

const handler: Handler = async (event) => {
  const token = event.queryStringParameters?.token

  if (!token) {
    return {
      statusCode: 400,
      body: 'Token no proporcionado'
    }
  }

  // Obtener IP del visitante
  const ip = event.headers['x-forwarded-for']?.split(',')[0] || event.headers['client-ip'] || 'IP no disponible'

  console.log(`Verificando token: ${token} desde IP: ${ip}`)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      quote_id: number
      customer_id: number
    }

    const { data, error } = await supabase.from('quotes').select('*').eq('id', decoded.quote_id).eq('access_token', token).single()

    if (error || !data) {
      return {
        statusCode: 404,
        body: 'Cotización no encontrada o token inválido'
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ quote: data, ip })
    }
  } catch (err) {
    return {
      statusCode: 401,
      body: 'Token inválido o expirado: ' + (err instanceof Error ? err.message : '')
    }
  }
}

export { handler }
