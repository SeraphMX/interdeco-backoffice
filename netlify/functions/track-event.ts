import { Handler } from '@netlify/functions'
import { supabase } from '../lib/supabase'

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')

    const ip = event.headers['x-forwarded-for']?.split(',')[0] || null
    const userAgent = event.headers['user-agent'] || null

    const { quoteId, action, userId } = body

    if (!quoteId || !action) {
      return {
        statusCode: 400,
        body: 'Faltan campos requeridos: quoteId o action.'
      }
    }

    const { error } = await supabase.from('quote_access_logs').insert({
      quote_id: quoteId,
      action: action,
      user_id: userId ?? null,
      ip_address: ip,
      user_agent: userAgent
    })

    if (error) {
      console.error('Supabase error:', error)
      return { statusCode: 500, body: 'Error al registrar la acción' }
    }

    return {
      statusCode: 200,
      body: 'Evento registrado correctamente'
    }
  } catch (error) {
    console.error('Error parsing body:', error)
    return {
      statusCode: 400,
      body: 'JSON inválido'
    }
  }
}

export { handler }
