import { Spinner } from '@heroui/react'
import { PDFViewer } from '@react-pdf/renderer'
import { useEffect, useState } from 'react'
import { QuotePDF } from '../components/quotes/QuotePDF'

export const QuotePreviewPage = () => {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem('previewQuote')

    if (raw) {
      const parsed = JSON.parse(raw)

      // Limpieza inmediata (opcional)
      //sessionStorage.removeItem('previewQuote')

      // // Normalización defensiva
      // const normalized = {
      //   ...parsed,
      //   total: Number(parsed.total),
      //   items: (parsed.items ?? []).map((item: any) => ({
      //     ...item,
      //     subtotal: Number(item.subtotal),
      //     product: {
      //       ...item.product,
      //       price: Number(item.product.price)
      //     }
      //   }))
      // }

      setQuote(parsed)
    }

    // Simulamos carga breve para mostrar el spinner
    const timeout = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timeout)
  }, [])

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 18,
          fontFamily: 'sans-serif'
        }}
      >
        <Spinner size='lg' label='Generando PDF...' labelColor='primary' />
      </div>
    )
  }

  if (!quote) {
    return <p>No se encontró una cotización para previsualizar.</p>
  }

  return (
    <PDFViewer style={{ width: '100vw', height: '100vh' }}>
      <QuotePDF quote={quote} />
    </PDFViewer>
  )
}
