import { Alert, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { TriangleAlert } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

interface ModalUserConfirmDeleteProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
}

const ModalUserConfirmDelete = ({ isOpen, onOpenChange, onConfirm }: ModalUserConfirmDeleteProps) => {
  const user = useSelector((state: RootState) => state.users.selectedUser)
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm' backdrop='opaque'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Eliminar usuario</ModalHeader>
            <ModalBody>
              <p>
                ¿Estás seguro que deseas eliminar al usuario <span className='font-semibold'>{user?.full_name}</span>?
              </p>

              <Alert
                classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
                hideIconWrapper
                color='danger'
                icon={<TriangleAlert />}
                title='¡Atención! Esta acción es irreversible'
                description='Se eliminarán los datos del usuario y no podrá iniciar sesión.'
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

export default ModalUserConfirmDelete
