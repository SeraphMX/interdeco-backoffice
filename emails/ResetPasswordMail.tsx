import { Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from '@react-email/components'
import React, { CSSProperties } from 'react'

void React.createElement

const baseUrl = process.env.VITE_PUBLIC_BASE_URL || 'http://localhost:8888'

interface SendQuoteMailProps {
  user: {
    full_name: string | null
    reset_token: string
  }
}

const ResetPasswordMail = ({ user }: SendQuoteMailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Haz solicitado el restablecimiento de tu contraseña</Preview>
      <Container style={container}>
        <Section style={coverSection}>
          <Section style={imageSection}>
            <Img
              src={`https://backoffice-interdeco.netlify.app/branding/logo-interdeco-full.png`}
              width='190'
              height='150'
              alt='Logo InterDeco'
              style={{
                display: 'inline-block',
                margin: '0 auto'
              }}
            />
          </Section>
          <Section style={upperSection}>
            <Heading style={h1}>¡Hola! {user.full_name}</Heading>
            <Text style={mainText}>
              Para restablecer tu contraseña, haz clic en el siguiente botón. Si no has solicitado este cambio, ignora este correo
              electrónico.
            </Text>
            <Section style={verificationSection}>
              <Button style={button} href={baseUrl + `/cuenta/reset-password/${user.reset_token}`}>
                Restablecer contraseña
              </Button>
            </Section>
          </Section>
        </Section>
        <Text style={footerText}>
          <strong>El enlace es válido solo por 15 minutos.</strong> Este mensaje fue enviado por{' '}
          <Link href='https://interdeco.mx'>InterDeco</Link>, si usted no es el destinatario previsto, le pedimos eliminarlo y notificar al
          remitente. Consulta nuestro <Link href={`https://interdeco.mx/privacidad`}>aviso de privacidad</Link> para conocer cómo protegemos
          tus datos. Esta comunicación es confidencial y puede contener información comercial o técnica dirigida únicamente al destinatario.
          InterDeco no asume responsabilidad por decisiones basadas en información incompleta, fuera de contexto o modificada.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ResetPasswordMail

ResetPasswordMail.PreviewProps = {
  user: {
    full_name: 'Juan Pérez',
    reset_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJxdW90ZV9pZCI6MTI2LCJpYXQiOjE3NTE4MDE0NTYsImV4cCI6MTc1MTg4Nzg1Nn0.z2o42-7N2SC_uLMZ6JVcmHy1dZpc_E-uH2r38WiI8-w'
  }
}

const main = {
  backgroundColor: '#fff',
  color: '#212121'
}

const button: CSSProperties = {
  padding: '12px 24px',
  backgroundColor: '#4fcbba',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  color: '#fff',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  textAlign: 'center',
  display: 'inline-block'
}

const container = {
  padding: '20px',
  margin: '0 auto',
  backgroundColor: '#eee'
}

const h1: CSSProperties = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '15px',
  textAlign: 'center'
}

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '24px 0'
}

const imageSection: CSSProperties = {
  padding: '30px 0 0',
  textAlign: 'center'
}

const coverSection = { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }

const upperSection = { padding: '25px 35px' }

const footerText = {
  ...text,
  fontSize: '11px',
  padding: '0 20px',
  lineHeight: '14px'
}

const verificationSection: CSSProperties = {
  textAlign: 'center'
}

const mainText = { ...text, marginBottom: '25px' }
