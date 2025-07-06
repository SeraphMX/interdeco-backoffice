import { Button, Chip, Spinner, Tooltip, useDisclosure } from '@heroui/react'
import { BrushCleaning, CloudAlert, CloudCheck, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useDebouncedAutoSave } from '../../../hooks/useDebounceAutosave'
import { RootState } from '../../../store'
import { clearItems } from '../../../store/slices/quoteSlice'
import { formatDate, parseISOtoRelative } from '../../../utils/date'
import ModalAddProduct from '../modals/ModalAddProduct'
import ModalConfirmClear from '../modals/ModalConfirmClear'

const QuoteItemsFooter = () => {
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)

  const { isOpen: isOpenAddProduct, onOpen: onOpenAddProduct, onOpenChange: onOpenChangeAddProduct } = useDisclosure()
  const { isOpen: isOpenConfirmClear, onOpen: onOpenConfirmClear, onOpenChange: onOpenChangeConfirmClear } = useDisclosure()

  const handleClearItems = () => {
    dispatch(clearItems())
    onOpenChangeConfirmClear()
  }

  const { isSaving, isSaved, isDirty } = useDebouncedAutoSave(quote.data, 3000)

  return (
    <footer className='sticky bottom-0 left-0 right-0  p-2 px-6 shadow-medium bg-white z-10 flex justify-between items-center '>
      {quote.data.status === 'open' && (
        <section className='flex justify-start items-center'>
          <Button size='md' color='primary' variant='light' startContent={<Plus size={18} />} onPress={onOpenAddProduct}>
            Agregar producto
          </Button>
          {(quote.data.items ?? []).length > 0 && (
            <Button size='md' color='danger' variant='light' startContent={<BrushCleaning size={18} />} onPress={onOpenConfirmClear}>
              Limpiar productos
            </Button>
          )}
          <ModalConfirmClear isOpen={isOpenConfirmClear} onOpenChange={onOpenChangeConfirmClear} onConfirm={handleClearItems} />
          <ModalAddProduct isOpen={isOpenAddProduct} onOpenChange={onOpenChangeAddProduct} />
        </section>
      )}
      <section className='flex justify-end items-center gap-2'>
        {(quote.data.items?.length ?? 0) > 0 && (
          <>
            <Chip color='primary' className='text-sm' variant='flat' size='lg'>
              {quote.data.items?.length ?? 0} {(quote.data.items?.length ?? 0) > 1 ? 'items' : 'item'}
            </Chip>

            {quote.data.status === 'open' && (
              <Chip
                color={isSaving ? 'primary' : isSaved ? 'success' : isDirty ? 'warning' : 'default'}
                className='text-sm'
                variant='flat'
                size='lg'
                startContent={
                  isSaved ? (
                    <CloudCheck size={24} />
                  ) : isSaving ? (
                    <Spinner size='sm' />
                  ) : isDirty ? (
                    <CloudAlert size={24} />
                  ) : (
                    <CloudCheck size={24} />
                  )
                }
              >
                {isSaved ? 'Guardada' : isSaving ? 'Guardando...' : isDirty ? 'Sin guardar' : 'Sin cambios'}
              </Chip>
            )}
          </>
        )}
        {quote.data.status === 'sent' && (
          <Tooltip
            content={`Fecha: 
              ${formatDate(quote.data.last_updated ?? '')}`}
          >
            <Chip className='text-sm' variant='flat' size='lg'>
              Enviada: {quote.data.last_updated ? parseISOtoRelative(quote.data.last_updated) : 'Fecha no disponible'}
            </Chip>
          </Tooltip>
        )}
      </section>
    </footer>
  )
}

export default QuoteItemsFooter
