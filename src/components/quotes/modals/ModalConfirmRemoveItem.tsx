import { Alert, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { TriangleAlert } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
}

const ModalConfirmRemoveItem = ({ isOpen, onOpenChange, onConfirm }: ModalSelectCustomerProps) => {
  const selectedItem = useSelector((state: RootState) => state.quote.selectedItem)
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm' backdrop='opaque'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Eliminar elemento</ModalHeader>
            <ModalBody>
              <p>¿Estás seguro que deseas eliminar este elemento de la cotización?</p>
              <p>
                <span className='font-semibold text-sm'>
                  {selectedItem?.product.sku} {selectedItem?.product.spec}{' '}
                </span>
                - {selectedItem?.totalQuantity.toFixed(2)} {selectedItem?.product.measurement_unit}
              </p>
              <Alert
                classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
                hideIconWrapper
                color='danger'
                icon={<TriangleAlert />}
                title='Advertencia'
                description='Esto no se puede deshacer'
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

export default ModalConfirmRemoveItem
