import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { addToast, useDisclosure } from '@heroui/react'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { Archive, ArchiveRestore, Clock, DollarSign, FileDown, FileSearch, Save, Send, Trash2, X } from 'lucide-react'
import { isBrowser, isMobile } from 'react-device-detect'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { quoteService } from '../../../services/quoteService'
import { RootState } from '../../../store'
import { clearQuote, setQuote, setQuoteStatus } from '../../../store/slices/quoteSlice'
import { getQuoteID } from '../../../utils/strings'
import ActionButton from '../../shared/ActionButton'
import ModalConfirmDeleteQuote from '../modals/ModalConfirmDeleteQuote'
import { QuotePDF } from '../QuotePDF'
import ModalPayment from './modals/ModalPayment'
import ModalQuoteSend from './modals/ModalQuoteSend'

interface QuoteActionsProps {
  type?: 'header' | 'footer'
}
const QuoteActions = ({ type = 'footer' }: QuoteActionsProps) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const quote = useSelector((state: RootState) => state.quote)
  const { user } = useSelector((state: RootState) => state.auth)

  const {
    isOpen: isOpenConfirmDeleteQuote,
    onOpen: onOpenConfirmDeleteQuote,
    onOpenChange: onOpenChangeConfirmDeleteQuote
  } = useDisclosure()

  const { isOpen: isOpenSendQuote, onOpen: onOpenSendQuote, onOpenChange: onOpenChangeSendQuote } = useDisclosure()
  const { isOpen: isOpenPaymentModal, onOpen: onOpenPaymentModal, onOpenChange: onOpenChangePaymentModal } = useDisclosure()

  const handlePreviewQuote = () => {
    sessionStorage.setItem('previewQuote', JSON.stringify(quote.data))
    window.open('/cotizacion/preview', '_blank')
  }

  const handleDownloadQuote = async () => {
    const blob = await pdf(<QuotePDF quote={quote.data} />).toBlob()
    saveAs(blob, `InterDeco Cotización-${getQuoteID(quote.data)}.pdf`)
    await quoteService.logQuoteAction(quote.data, 'downloaded')
  }

  const handleSaveQuote = async () => {
    if (!quote.data.id) {
      const savedQuote = await quoteService.saveQuote(quote.data, user?.id)

      if (savedQuote.success && savedQuote.quote) {
        dispatch(
          setQuote({
            ...quote.data,
            id: savedQuote.quote.id,
            last_updated: savedQuote.quote.last_updated,
            access_token: savedQuote.quote.access_token
          })
        )
      }
    }
  }

  const handleDeleteQuote = async () => {
    if (!quote.data.id) {
      addToast({
        title: 'Error',
        description: 'No se puede eliminar una cotización que no ha sido guardada.',
        color: 'danger'
      })
      return
    }

    if (quote.data.status === 'open') {
      const result = await quoteService.deleteQuote(quote.data)

      if (result.success) {
        dispatch(clearQuote())
        navigate('/cotizaciones')
      } else {
        console.error('Error al eliminar la cotización:', result.error)
      }
    } else {
      const updateResult = await quoteService.updateQuote({ ...quote.data, status: 'archived' })

      if (!updateResult.success) {
        console.error('Error al archivar la cotización:', updateResult.error)
        addToast({
          title: 'Error al archivar',
          description: 'Hubo un error al archivar la cotización. Inténtalo de nuevo.',
          color: 'danger'
        })
        return
      }

      addToast({
        title: 'Cotización archivada',
        description: 'La cotización ha sido archivada correctamente.',
        color: 'success'
      })
      navigate('/cotizaciones')
      dispatch(setQuote(updateResult.quote))
    }
  }

  const handleRestoreQuote = async () => {
    console.log('Restaurando cotización', quote.data.id)

    const updatedQuote = await quoteService.setQuoteStatus(quote.data.id ?? 0, 'open')

    dispatch(setQuote(updatedQuote.quote))

    addToast({
      title: 'Cotización restaurada',
      description: 'La cotización ha sido restaurada correctamente.',
      color: 'success'
    })
  }

  const handleCloseQuote = () => {
    navigate(-1) // Regresa a la página anterior
  }

  const handleSendQuote = () => {
    dispatch(setQuoteStatus('sent'))
    onOpenChangeSendQuote()
  }

  const handleSendMessage = () => {
    const phone = '524272794272' // sin + ni espacios
    const message = `Hola, revisé mi cotización: ${quote.data.id && `#${getQuoteID(quote.data)}`}`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank') // Abre WhatsApp en una nueva pestaña
  }

  const handleViewHistory = () => {
    console.log('Ver historial de cotización')
  }

  const isHeader = type === 'header'
  const isFooter = type === 'footer'

  const renderPublicActions = () => (
    <>
      {quote.isPublicAccess && isFooter && (
        <ActionButton icon={<DollarSign />} label='Pagar' color='primary' onClick={onOpenPaymentModal} tooltip={'¿Cómo pagar?'} />
      )}
    </>
  )

  const renderInternalActions = () => {
    if (!quote.data.id) return null
    if (quote.isPublicAccess) return null

    return (
      <>
        {isMobile && (
          <ActionButton icon={<Clock />} label='Historial' color='secondary' tooltip={'Ver historial'} onClick={handleViewHistory} />
        )}
        <ActionButton
          icon={<Send />}
          label={quote.data.status !== 'sent' ? 'Enviar' : 'Reenviar'}
          color='secondary'
          onClick={onOpenSendQuote}
        />
        {quote.data.status === 'open' && (
          <ActionButton icon={<Trash2 />} label='Eliminar' color='danger' onClick={onOpenConfirmDeleteQuote} />
        )}
        {quote.data.status === 'archived' && (
          <ActionButton icon={<ArchiveRestore />} label='Restaurar' color='primary' onClick={handleRestoreQuote} />
        )}
        {quote.data.status !== 'sent' && quote.data.status !== 'open' && quote.data.status !== 'archived' && (
          <ActionButton icon={<Archive />} label='Archivar' color='danger' onClick={onOpenConfirmDeleteQuote} />
        )}
        <ActionButton icon={<X />} label='Cerrar' color='danger' onClick={handleCloseQuote} />

        <ModalQuoteSend isOpen={isOpenSendQuote} onOpenChange={onOpenChangeSendQuote} onConfirm={handleSendQuote} />

        <ModalConfirmDeleteQuote
          isOpen={isOpenConfirmDeleteQuote}
          onOpenChange={onOpenChangeConfirmDeleteQuote}
          onConfirm={handleDeleteQuote}
        />
      </>
    )
  }

  const renderMobileActions = () => {
    if (!isHeader) return null

    return (
      <>
        <ActionButton icon={<FontAwesomeIcon icon={faWhatsapp} size='2x' />} label='Mensaje' color='success' onClick={handleSendMessage} />
      </>
    )
  }

  const renderBrowserActions = () => (
    <>
      <ActionButton icon={<FileSearch />} label='Ver PDF' color='secondary' onClick={handlePreviewQuote} />
      {quote.isPublicAccess && (
        <ActionButton
          icon={<FontAwesomeIcon icon={faWhatsapp} size='2x' />}
          label='Mensaje'
          color='success'
          onClick={handleSendMessage}
          tooltip={'¿Tienes dudas? Envía un mensaje'}
        />
      )}
    </>
  )

  const renderDownloadButton = () => {
    if (isFooter && quote.isPublicAccess && isMobile) return null
    return <ActionButton icon={<FileDown />} label='Descargar' color='secondary' onClick={handleDownloadQuote} />
  }

  return (
    (quote.data.items ?? []).length > 0 && (
      <section
        className={`flex justify-center sm:justify-end ${isMobile ? 'gap-2' : 'gap-3'} ${!quote.isPublicAccess && 'order-2 sm:order-1'}`}
      >
        {/* Guardar cotización (cuando no tiene ID) */}
        {!quote.data.id && <ActionButton icon={<Save />} label='Guardar' color='primary' onClick={handleSaveQuote} />}

        {/* Acciones por tipo de dispositivo */}
        {isMobile && isHeader && renderMobileActions()}
        {renderDownloadButton()}
        {isBrowser && renderBrowserActions()}

        {/* Acciones si la cotización es pública */}
        {renderPublicActions()}

        {/* Acciones internas si ya está guardada */}
        {renderInternalActions()}

        {/* Modal de pago */}
        <ModalPayment isOpen={isOpenPaymentModal} onOpenChange={onOpenChangePaymentModal} />
      </section>
    )
  )
}

export default QuoteActions
