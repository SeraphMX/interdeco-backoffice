import { addToast, Button, Card, CardBody, useDisclosure } from '@heroui/react'
import { Archive, ArchiveRestore, File, MailPlus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { quoteService } from '../../../services/quoteService'
import { RootState } from '../../../store'
import { clearQuote, setQuote, setQuoteStatus, setQuoteTotal } from '../../../store/slices/quoteSlice'
import { formatCurrency } from '../../../utils/currency'
import { formatDate } from '../../../utils/date'
import ModalConfirmDeleteQuote from '../modals/ModalConfirmDeleteQuote'

const QuoteFooter = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [taxes, setTaxes] = useState(0)
  const [subtotal, setSubtotal] = useState(0)

  const quote = useSelector((state: RootState) => state.quote)

  const {
    isOpen: isOpenConfirmDeleteQuote,
    onOpen: onOpenConfirmDeleteQuote,
    onOpenChange: onOpenChangeConfirmDeleteQuote
  } = useDisclosure()

  const handlePreviewQuote = () => {
    sessionStorage.setItem('previewQuote', JSON.stringify(quote.data))
    window.open('/cotizaciones/preview', '_blank')
  }

  const handleSaveQuote = async () => {
    if (!quote.data.id) {
      const savedQuote = await quoteService.saveQuote(quote.data)

      if (savedQuote.success) {
        if (!savedQuote) return
        dispatch(setQuote(savedQuote.quote))
        addToast({
          title: 'Cotización guardada',
          description: savedQuote.quote?.created_at ? formatDate(savedQuote.quote.created_at) : 'Fecha no disponible',
          color: 'success'
        })
      } else {
        console.error('Error al guardar la cotización:', savedQuote.error)
        addToast({
          title: 'Error al guardar',
          description: 'Hubo un error al guardar la cotización. Inténtalo de nuevo.',
          color: 'danger'
        })
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
    dispatch(setQuoteStatus('sent'))
    addToast({
      title: 'Enviar cotización',
      description: 'Funcionalidad de envío de cotización aún no implementada.',
      color: 'primary'
    })
  }

  useEffect(() => {
    if ((quote.data.items ?? []).length > 0) {
      setSubtotal((quote.data.items ?? []).reduce((acc, item) => acc + item.subtotal, 0))
      setTaxes((quote.data.items ?? []).reduce((acc, item) => acc + item.subtotal * 0.16, 0))
      dispatch(setQuoteTotal(subtotal + taxes))
    }
  }, [quote.data.items, subtotal, taxes, dispatch])

  if (!quote.data) {
    return null
  }

  return (
    <footer>
      <Card className='p-4 px-8'>
        <CardBody className='flex flex-row justify-between items-center gap-4'>
          {!quote.isPublicAccess ? (
            <section className='flex justify-end gap-3'>
              {!quote.data.id && (
                <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='primary' variant='ghost' onPress={handleSaveQuote}>
                  <Save />
                  Guardar
                </Button>
              )}
              <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='secondary' variant='ghost' onPress={handlePreviewQuote}>
                <File />
                Ver PDF
              </Button>
              {quote.data.id && (
                <>
                  <Button className='flex flex-col h-16 w-16 p-2 gap-0 ' color='secondary' variant='ghost' onPress={handleSendQuote}>
                    <MailPlus />
                    Enviar
                  </Button>
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
                      <Button
                        className='flex flex-col h-16 w-16 p-2 gap-0'
                        color='danger'
                        variant='ghost'
                        onPress={onOpenConfirmDeleteQuote}
                      >
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
          ) : (
            'Mensaje de texto publico para cotizaciones públicas'
          )}

          <div className='flex flex-col gap-2 text-right'>
            <div className='text-lg'>
              <span className='font-medium'>Subtotal:</span>
              <span className='ml-2'> {formatCurrency(subtotal)}</span>
            </div>
            <div className='text-lg'>
              <span className='font-medium'>IVA:</span>
              <span className='ml-2'>{formatCurrency(taxes)}</span>
            </div>
            <div className='text-xl font-semibold'>
              <span>Total:</span>
              <span className='ml-2'>{formatCurrency(quote.data.total)}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </footer>
  )
}

export default QuoteFooter
