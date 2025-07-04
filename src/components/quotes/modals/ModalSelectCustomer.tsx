import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { clearSelectedCustomer, setSelectedCustomer } from '../../../store/slices/quoteSlice'
import { Customer } from '../../../types'
import ModalCustomerEditAdd from '../../customers/modals/ModalCustomerEditAdd'
import CustomerIcon from '../../shared/CustomerIcon'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const ModalSelectCustomer = ({ isOpen, onOpenChange }: ModalSelectCustomerProps) => {
  const customers = useSelector((state: RootState) => state.clientes.items)
  const selectedCustomer = useSelector((state: RootState) => state.quote.selectedCustomer)
  const dispatch = useDispatch()
  const [defaultSelectedKey, setDefaultSelectedKey] = useState<string | null>(null)
  const { isOpen: isOpenEditAdd, onOpen: onOpenEditAdd, onOpenChange: onOpenChangeEditAdd } = useDisclosure()

  const handleSelectCustomer = (key: React.Key | null) => {
    if (key) {
      const customer = customers.find((c) => c.id == key)
      if (customer) {
        dispatch(setSelectedCustomer(customer))
      }
    } else {
      dispatch(clearSelectedCustomer())
    }
  }

  useEffect(() => {
    if (isOpen && selectedCustomer) {
      setDefaultSelectedKey(selectedCustomer?.id?.toString() || null)
    } else {
      setDefaultSelectedKey(null)
    }
  }, [isOpen, selectedCustomer])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='lg' backdrop='blur'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>{!selectedCustomer ? 'Seleccionar cliente' : 'Cambiar cliente'}</ModalHeader>
            <ModalBody>
              <Autocomplete
                defaultItems={customers}
                label='Cliente'
                isClearable
                size='sm'
                onSelectionChange={handleSelectCustomer}
                selectedKey={defaultSelectedKey}
              >
                {(customer) => (
                  <AutocompleteItem
                    key={customer.id}
                    startContent={<CustomerIcon customerType={customer.customer_type} className='text-gray-600' />}
                  >
                    {customer.name}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </ModalBody>
            <ModalFooter className='flex justify-between gap-2'>
              <Button variant='bordered' color='primary' onPress={onOpenEditAdd}>
                Agregar nuevo
              </Button>
              <ModalCustomerEditAdd
                isOpen={isOpenEditAdd}
                onOpenChange={onOpenChangeEditAdd}
                onSuccess={(newCustomer: Customer | null) => {
                  if (newCustomer) {
                    dispatch(setSelectedCustomer(newCustomer))
                    onClose()
                  } else {
                    dispatch(clearSelectedCustomer())
                  }
                }}
              />
              <section>
                {!selectedCustomer ? (
                  <Button variant='light' color='danger' onPress={onClose}>
                    Cerrar
                  </Button>
                ) : (
                  <Button color='primary' isDisabled={!selectedCustomer} onPress={onClose}>
                    Aceptar
                  </Button>
                )}
              </section>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalSelectCustomer
