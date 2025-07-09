import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import QuoteHistoryTable from '../../QuoteHistoryTable'

interface ModalPaymentProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const ModalQuoteHistory = ({ isOpen, onOpenChange }: ModalPaymentProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='2xl'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Historial de la cotización</ModalHeader>
            <ModalBody>
              <QuoteHistoryTable />
            </ModalBody>
            <ModalFooter>
              <Button variant='light' color='primary' onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalQuoteHistory
