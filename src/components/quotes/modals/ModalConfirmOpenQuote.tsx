import { Alert, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
}

const ModalConfirmOpenQuote = ({ isOpen, onOpenChange, onConfirm }: ModalSelectCustomerProps) => {
  const navigate = useNavigate()
  const handleOpenCurrentQuote = () => {
    navigate('/cotizaciones/nueva')
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='xl' backdrop='blur'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Cotización en proceso</ModalHeader>
            <ModalBody>
              <p>Existe una cotización en proceso sin guardar. ¿Quieres ver la cotización en curso o abrir esta?</p>

              <Alert
                classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
                hideIconWrapper
                color='warning'
                icon={<TriangleAlert />}
                title='Advertencia'
                description=' Al abrir esta cotización los datos no guardados se perderán'
              />
            </ModalBody>
            <ModalFooter>
              <Button variant='light' color='danger' onPress={onClose}>
                Cancelar
              </Button>
              <Button color='secondary' variant='ghost' onPress={handleOpenCurrentQuote}>
                Ver la cotización en curso
              </Button>
              <Button color='primary' onPress={onConfirm}>
                Abrir esta cotización
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalConfirmOpenQuote
