import { Alert, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { TriangleAlert } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

interface ModalCustomerConfirmDeleteProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
}

const ModalCustomerConfirmDelete = ({ isOpen, onOpenChange, onConfirm }: ModalCustomerConfirmDeleteProps) => {
  const customer = useSelector((state: RootState) => state.clientes.selectedCustomer)
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm' backdrop='opaque'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Eliminar cliente</ModalHeader>
            <ModalBody>
              <p>
                ¿Estás seguro que deseas eliminar al cliente <span className='font-semibold'>{customer?.name}</span>?
              </p>

              <Alert
                classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
                hideIconWrapper
                color='danger'
                icon={<TriangleAlert />}
                title='¡Atención! Esta acción es irreversible'
                description='Se eliminarán los datos del cliente, pero se conservará el historial de cotizaciones.'
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
