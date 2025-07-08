import { Handler } from '@netlify/functions'
import { render } from '@react-email/render'
import nodemailer from 'nodemailer'
import React from 'react'
import SendQuoteMail from '../../emails/SendQuoteMail'

const handler: Handler = async (event) => {
  const { to, quote } = JSON.parse(event.body || '{}')

  const transporter = nodemailer.createTransport({
    host: 'mail.spacemail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  })

  const html = await render(React.createElement(SendQuoteMail, { quote }))

  console.log('Enviando correo a:', to)

  try {
    await transporter.sendMail({
      from: `"InterDeco" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Cotización de InterDeco',
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
