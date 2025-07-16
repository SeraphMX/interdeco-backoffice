import { Handler } from '@netlify/functions'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'

const JWT_SECRET = process.env.JWT_SECRET!

const handler: Handler = async (event) => {
  const body = JSON.parse(event.body || '{}')
  const resetEmail = body.email

  console.log('Received data:', resetEmail)

  if (!resetEmail) {
    return {
      statusCode: 400,
      body: 'Es necesario proporcionar un correo electrónico.'
    }
  }

  const { data, error } = await supabase.rpc('get_reset_data_by_email', { check_email: resetEmail })

  if (error || !data) {
    return {
      statusCode: 404,
      body: 'Cotización no encontrada o token inválido'
    }
  }

  const [{ id, full_name, email, role }] = data
  const token = jwt.sign({ id, full_name, email, role }, JWT_SECRET, { expiresIn: '15m' })

  // TODO:Guardar el token en el historial
  //await supabase.from('quotes').update({ access_token: token }).eq('id', email.id)

  return {
    statusCode: 200,
    body: JSON.stringify({ password_token: token })
  }
}

export { handler }
