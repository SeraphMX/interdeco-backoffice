import { Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from '@react-email/components'
import React, { CSSProperties } from 'react'
import { Quote } from '../src/types'

void React.createElement

const baseUrl = process.env.VITE_PUBLIC_BASE_URL || 'http://localhost:8888'

const SendQuoteMail = ({ quote }: { quote: Quote }) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Tienes una nueva cotización disponible para consultar</Preview>
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
            <Heading style={h1}>¡Hola! {quote.customer_name}</Heading>
            <Text style={mainText}>
              Gracias por tu interés en nuestros productos y servicios. Hemos preparado una cotización personalizada para ti. Puedes
              consultarla en línea o descargarla haciendo clic en el botón de abajo.
            </Text>
            <Section style={verificationSection}>
              <Button style={button} href={baseUrl + `/cotizacion/${quote.access_token}`}>
                Ver cotización
              </Button>
            </Section>
          </Section>
        </Section>
        <Text style={footerText}>
          <strong>Este enlace es válido solo por 15 dias naturales</strong>. Este mensaje fue enviado por{' '}
          <Link href='https://interdeco.mx'>InterDeco</Link>, si usted no es el destinatario previsto, le pedimos eliminarlo y notificar al
          remitente. Consulta nuestro <Link href={`https://interdeco.mx/privacidad`}>aviso de privacidad</Link> para conocer cómo protegemos
          tus datos. Esta comunicación es confidencial y puede contener información comercial o técnica dirigida únicamente al destinatario.
          InterDeco no asume responsabilidad por decisiones basadas en información incompleta, fuera de contexto o modificada.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SendQuoteMail

SendQuoteMail.PreviewProps = {
  quote: {
    customer_name: 'Juan Pérez',
    access_token:
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
