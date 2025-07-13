import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store'
import { formatCurrency } from '../../../../utils/currency'
import { getQuoteID } from '../../../../utils/strings'
import InputClipboard from '../../../shared/InputClipboard'

interface ModalPaymentProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const ModalPayment = ({ isOpen, onOpenChange }: ModalPaymentProps) => {
  const rxQuote = useSelector((state: RootState) => state.quote.data)
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>¿Cómo pagar?</ModalHeader>
            <ModalBody>
              <p className='text-sm text-gray-800 '>
                Todo trabajo requiere de un 60% de anticipo, el cual se podrá pagar en efectivo, mediante depósito o transferencia
                electrónica a la siguiente cuenta.
              </p>
              <section>
                <div className='flex gap-2 mb-4'>
                  <Input
                    label='Banco'
                    value='Banorte'
                    fullWidth
                    readOnly
                    variant='bordered'
                    classNames={{ inputWrapper: 'border-none shadow-none ' }}
                    className='w-3/5'
                  />
                  <InputClipboard label='Cantidad sugerida' value={formatCurrency(rxQuote.total * 0.6)} />
                </div>
                <InputClipboard label='Titular' value='Sandra Briseño Hidalgo' />
                <InputClipboard label='Número de cuenta' value='0438767692' />
                <InputClipboard label='Clabe interbancaria' value='072197004387676926' />
                <InputClipboard label='Concepto de pago' value={`Anticipo de cotización #${getQuoteID(rxQuote)}`} />
              </section>
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

export default ModalPayment
