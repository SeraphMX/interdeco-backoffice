import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import AddCustomer from '../../forms/AddCustomer'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const ModalCustomerEditAdd = ({ isOpen, onOpenChange }: ModalSelectCustomerProps) => {
  const customer = useSelector((state: RootState) => state.clientes.selectedCustomer)
  return (
    <Modal size='xl' isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Nuevo Cliente</ModalHeader>
            <ModalBody>
              <AddCustomer
                customer={customer}
                onSuccess={() => {
                  onClose()
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                Cancelar
              </Button>
              <Button color='primary' type='submit' form='add-customer-form'>
                Guardar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalCustomerEditAdd
