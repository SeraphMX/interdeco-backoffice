import { Alert, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { TriangleAlert } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
}

const ModalCustomerConfirmDelete = ({ isOpen, onOpenChange, onConfirm }: ModalSelectCustomerProps) => {
  const quote = useSelector((state: RootState) => state.quote.data)
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm' backdrop='opaque'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>{quote.status === 'open' ? 'Eliminar' : 'Archivar'} cotización</ModalHeader>
            <ModalBody>
              <p>¿Estás seguro que deseas eliminar al cliente {'cliente'}?</p>

              <Alert
                classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
                hideIconWrapper
                color='danger'
                icon={<TriangleAlert />}
                title='Advertencia'
                description='¡Atención! Esta acción eliminará los datos del cliente, pero conservara el historial de cotizaciones. Esto no se puede deshacer'
              />
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

export default ModalCustomerConfirmDelete
