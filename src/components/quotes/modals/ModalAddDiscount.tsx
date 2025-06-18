import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@heroui/react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const ModalAddDiscount = ({ isOpen, onOpenChange }: ModalSelectCustomerProps) => {
  const customers = useSelector((state: RootState) => state.clientes.items)
  const selectedCustomer = useSelector((state: RootState) => state.quote.selectedCustomer)
  const dispatch = useDispatch()
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')

  useEffect(() => {
    console.log('modal open state changed:', isOpen)
  }, [isOpen, selectedCustomer])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='lg' backdrop='blur'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Agregar descuento</ModalHeader>
            <ModalBody>
              <RadioGroup label='Elije el tipo de descuento' orientation='horizontal'>
                <Radio value='buenos-aires'>Porcentaje</Radio>
                <Radio value='sydney'>Directo</Radio>
              </RadioGroup>

              <section className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                <div className='flex flex-col gap-2 justify-center items-center'>
                  <span>80</span>
                  <small>Predio original</small>
                </div>
                <Input
                  label='Cantidad'
                  className='text-center'
                  classNames={{
                    input: 'text-center',
                    inputWrapper: 'justify-center', // centrado horizontal del input
                    label: 'self-center text-center' // centra el label
                  }}
                />
                <div className='flex flex-col gap-2 justify-center items-center'>
                  <span>80</span>
                  <small>Con descuento</small>
                </div>
              </section>
            </ModalBody>
            <ModalFooter>
              {!selectedCustomer ? (
                <Button variant='light' color='danger' onPress={onClose}>
                  Cerrar
                </Button>
              ) : (
                <Button color='primary' isDisabled={!selectedCustomer} onPress={onClose}>
                  Aceptar
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalAddDiscount
