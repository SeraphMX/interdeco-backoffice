import { addToast, Button, useDisclosure } from '@heroui/react'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { Archive, ArchiveRestore, FileDown, FileSearch, MailPlus, Save, Trash2, X } from 'lucide-react'
import { BrowserView } from 'react-device-detect'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { quoteService } from '../../../services/quoteService'
import { RootState } from '../../../store'
import { clearQuote, setQuote, setQuoteStatus } from '../../../store/slices/quoteSlice'
import ModalConfirmDeleteQuote from '../modals/ModalConfirmDeleteQuote'
import { QuotePDF } from '../QuotePDF'
import ModalSendQuote from './modals/ModalSendQuote'

const QuoteActions = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const quote = useSelector((state: RootState) => state.quote)

  const {
    isOpen: isOpenConfirmDeleteQuote,
    onOpen: onOpenConfirmDeleteQuote,
    onOpenChange: onOpenChangeConfirmDeleteQuote
  } = useDisclosure()

  const { isOpen: isOpenSendQuote, onOpen: onOpenSendQuote, onOpenChange: onOpenChangeSendQuote } = useDisclosure()

  const handlePreviewQuote = () => {
    sessionStorage.setItem('previewQuote', JSON.stringify(quote.data))
    window.open('/cotizacion/preview', '_blank')
  }

  const handleDownloadQuote = async () => {
    const blob = await pdf(<QuotePDF quote={quote.data} />).toBlob()
    saveAs(blob, 'cotizacion-interdeco.pdf')

    //saveAs(blob, 'cotizacion.pdf')
  }

  const handleSaveQuote = async () => {
    if (!quote.data.id) {
      const savedQuote = await quoteService.saveQuote(quote.data)

      if (savedQuote.success) {
        if (!savedQuote) return
        if (savedQuote.quote) {
          dispatch(setQuote({ ...quote.data, id: savedQuote.quote.id, last_updated: savedQuote.quote.last_updated }))
        }
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
    dispatch(clearQuote())
    navigate(-1) // Regresa a la página anterior
  }

  const handleSendQuote = () => {
    //onOpenSendQuote()
    dispatch(setQuoteStatus('sent'))
    onOpenChangeSendQuote()

    // addToast({
    //   title: 'Enviar cotización',
    //   description: 'Funcionalidad de envío de cotización aún no implementada.',
    //   color: 'primary'
    // })
  }
  return (
    (quote.data.items ?? []).length > 0 && (
      <section className='flex justify-end gap-3'>
        {!quote.data.id && (
          <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='primary' variant='ghost' onPress={handleSaveQuote}>
            <Save />
            Guardar
          </Button>
        )}
        <BrowserView>
          <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='secondary' variant='ghost' onPress={handlePreviewQuote}>
            <FileSearch />
            Ver PDF
          </Button>
        </BrowserView>

        <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='secondary' variant='ghost' onPress={handleDownloadQuote}>
          <FileDown />
          Descargar
        </Button>

        {/* <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='primary' variant='ghost'>
          <DollarSign />
          Pagar
        </Button> */}

        {quote.data.id && !quote.isPublicAccess && (
          <>
            {quote.data.status !== 'sent' && (
              <Button className='flex flex-col h-16 w-16 p-2 gap-0 ' color='secondary' variant='ghost' onPress={onOpenSendQuote}>
                <MailPlus />
                Enviar
              </Button>
            )}

            <ModalSendQuote isOpen={isOpenSendQuote} onOpenChange={onOpenChangeSendQuote} onConfirm={handleSendQuote} />

            {quote.data.status === 'open' ? (
              <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='danger' variant='ghost' onPress={onOpenConfirmDeleteQuote}>
                <Trash2 />
                Eliminar
              </Button>
            ) : quote.data.status === 'archived' ? (
              <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='primary' variant='ghost' onPress={handleRestoreQuote}>
                <ArchiveRestore />
                Restaurar
              </Button>
            ) : (
              quote.data.status !== 'sent' && (
                <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='danger' variant='ghost' onPress={onOpenConfirmDeleteQuote}>
                  <Archive />
                  Archivar
                </Button>
              )
            )}
            <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='danger' variant='ghost' onPress={handleCloseQuote}>
              <X />
              Cerrar
            </Button>
            <ModalConfirmDeleteQuote
              isOpen={isOpenConfirmDeleteQuote}
              onOpenChange={onOpenChangeConfirmDeleteQuote}
              onConfirm={handleDeleteQuote}
            />
          </>
        )}
      </section>
    )
  )
}

export default QuoteActions
