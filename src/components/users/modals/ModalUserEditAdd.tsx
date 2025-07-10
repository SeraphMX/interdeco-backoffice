import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import AddUser from '../../forms/AddUser'

interface ModalSelectUserProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSuccess?: () => void
}

const ModalUserEditAdd = ({ isOpen, onOpenChange, onSuccess }: ModalSelectUserProps) => {
  const selectedUser = useSelector((state: RootState) => state.users.selectedUser)

  return (
    <Modal size='xl' isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'> {!selectedUser ? 'Nuevo' : 'Actualizar'} usuario</ModalHeader>
            <ModalBody>
              <AddUser
                onSuccess={() => {
                  onClose()
                  onSuccess?.()
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                Cancelar
              </Button>
              <Button color='primary' type='submit' form='add-customer-form'>
                {!selectedUser ? 'Guardar' : 'Actualizar'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalUserEditAdd
