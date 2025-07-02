import { Alert, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { TriangleAlert } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
}

const ModalConfirmDeleteQuote = ({ isOpen, onOpenChange, onConfirm }: ModalSelectCustomerProps) => {
  const quote = useSelector((state: RootState) => state.quote.data)
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm' backdrop='opaque'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>{quote.status === 'open' ? 'Eliminar' : 'Archivar'} cotización</ModalHeader>
            <ModalBody>
              <p>
                ¿Estás seguro que deseas <strong>{quote.status === 'open' ? 'eliminar' : 'archivar'}</strong> la cotización{' '}
                <strong>{quote.created_at && `${quote.id}${new Date(quote.created_at).getFullYear().toString().slice(-2)}`}</strong>?
              </p>

              {quote.status === 'open' ? (
                <Alert
                  classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
                  hideIconWrapper
                  color='danger'
                  icon={<TriangleAlert />}
                  title='Advertencia'
                  description='Esto no se puede deshacer'
                />
              ) : (
                <Alert
                  classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
                  hideIconWrapper
                  color='warning'
                  icon={<TriangleAlert />}
                  title='Importante'
                  description='La cotización no se mostrará en la lista de cotizaciones y no estará disponible para edición.'
                />
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant='light' color='danger' onPress={onClose}>
                Cancelar
              </Button>
              <Button color='primary' onPress={onConfirm}>
                Aceptar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalConfirmDeleteQuote
