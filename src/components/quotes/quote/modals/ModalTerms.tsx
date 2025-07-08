import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'

interface ModalTermsProps {
  isOpen: boolean
  onOpenChange: () => void
}
const ModalTerms = ({ isOpen, onOpenChange }: ModalTermsProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='md'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Términos de la cotización</ModalHeader>
            <ModalBody>
              <ul className='text-sm text-gray-600 list-disc list-inside space-y-1 '>
                <li>Vigencia de la cotización 3 días naturales</li>
                <li>Precios sujetos a cambio sin previo aviso y sujetos a existencia.</li>
                <li>Una vez realizado el pedido no se aceptan cambios de material ni cancelaciones.</li>
                <li>Los tiempos de entrega varían dependiendo del material.</li>
                <li>Mejoramos cualquier presupuesto presentado por escrito.</li>
                <li>Trabajo 100% garantizado.</li>
              </ul>

              <p className='text-sm'>
                En InterDeco confiamos tanto en la calidad y el valor de nuestro servicio, que te ofrecemos una{' '}
                <strong>garantía única</strong>: Si encuentras un presupuesto más bajo (por escrito y con los mismos materiales
                especificados) <strong>igualamos el precio</strong> y <strong>te regalamos la instalación</strong>.
              </p>
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

export default ModalTerms
