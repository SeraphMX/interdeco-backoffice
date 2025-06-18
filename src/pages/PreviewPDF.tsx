import { PDFViewer } from '@react-pdf/renderer'
import { QuotePDF } from '../components/quotes/QuotePDF'

// Mostrar el PDF directamente en una página o modal
export const QuotePreviewPage = () => {
  const quote = JSON.parse(localStorage.getItem('previewQuote') || 'null')

  if (!quote) {
    return <p>No se encontró una cotización para previsualizar.</p>
  }

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <QuotePDF quote={quote} />
    </PDFViewer>
  )
}
