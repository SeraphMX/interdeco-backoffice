import { Handler } from '@netlify/functions'
import { render } from '@react-email/render'
import nodemailer from 'nodemailer'
import React from 'react'
import ResetPasswordMail from '../../emails/ResetPasswordMail'

function getBaseUrl(event): string {
  const protocol = event.headers['x-forwarded-proto'] || 'https'
  const host = event.headers['host']
  return `${protocol}://${host}`
}

const handler: Handler = async (event) => {
  const { email } = JSON.parse(event.body || '{}')

  const transporter = nodemailer.createTransport({
    host: 'mail.spacemail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  })

  try {
    let baseUrl = getBaseUrl(event)

    if (baseUrl.includes('localhost')) {
      console.warn('Running in local development mode, using localhost URL:', baseUrl)
      baseUrl = baseUrl.replace('https://', 'http://')
    }

    const response = await fetch(`${baseUrl}/.netlify/functions/generate-password-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })

    const { password_token } = await response.json()

    if (!password_token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No se pudo generar el token de restablecimiento de contraseña' })
      }
    }

    const user = {
      full_name: null,
      reset_token: password_token
    }

    const html = await render(React.createElement(ResetPasswordMail, { user }))

    console.log('Enviando correo a:', email, ' Con token:', password_token)

    await transporter.sendMail({
      from: `"InterDeco" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Restablece tu contraseña',
      html
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Correo enviado correctamente' })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al enviar correo:', details: error })
    }
  }
}

export { handler }
