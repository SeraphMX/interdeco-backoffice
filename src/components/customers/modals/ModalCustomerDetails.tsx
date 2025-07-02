import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs, useDisclosure } from '@heroui/react'
import { Building2, Edit, SquareUserRound, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { customerService } from '../../../services/customerService'
import { RootState } from '../../../store'
import { clearSelectedCustomer } from '../../../store/slices/customersSlice'
import CustomerDetails from '../CustomerDetails'
import CustomerHistory from '../CustomerHistory'
import ModalCustomerConfirmDelete from './ModalCustomerConfirmDelete'
import ModalCustomerEditAdd from './ModalCustomerEditAdd'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: () => void
  onClose?: () => void
}

const ModalCustomerDetails = ({ isOpen, onOpenChange, onClose }: ModalSelectCustomerProps) => {
  const customer = useSelector((state: RootState) => state.clientes.selectedCustomer)
  const dispatch = useDispatch()
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onOpenChange: onOpenChangeDelete } = useDisclosure()
  const { isOpen: isOpenEditAdd, onOpen: onOpenEditAdd, onOpenChange: onOpenChangeEditAdd } = useDisclosure()

  const deleteCustomer = async () => {
    if (customer) {
      await customerService.deleteCustomer(customer)
      dispatch(clearSelectedCustomer())
    }
  }

  return (
    <>
      <Modal size='xl' isOpen={isOpen} onOpenChange={onOpenChange} onClose={onClose} backdrop='blur'>
        {customer && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className='flex items-center gap-1 '>
                  {customer.customer_type === 'individual' ? (
                    <SquareUserRound className='text-gray-500' size={24} />
                  ) : (
                    <Building2 className='text-gray-500' size={24} />
                  )}
                  <h3 className='text-xl font-semibold  truncate whitespace-nowrap overflow-hidden'>{customer.name}</h3>
                </ModalHeader>
                <ModalBody key={customer.id}>
                  <Tabs aria-label='Options' disableAnimation>
                    <Tab key='data' title='Datos del cliente'>
                      <CustomerDetails />
                    </Tab>
                    <Tab key='history' title='Historial'>
                      <CustomerHistory />
                    </Tab>
                    {/* <Tab key='insights' title='Informacíon'></Tab> */}
                  </Tabs>
                </ModalBody>
                <ModalFooter className='flex items-center justify-between'>
                  <section className='flex items-center gap-2'>
                    <Button color='primary' isIconOnly variant='ghost' onPress={onOpenEditAdd}>
                      <Edit size={20} />
                    </Button>
                    <Button color='danger' isIconOnly variant='ghost' onPress={onOpenDelete}>
                      <Trash2 size={20} />
                    </Button>
                  </section>
                  <section>
                    <Button color='danger' variant='light' onPress={onClose}>
                      Cerrar
                    </Button>
                    <Button color='primary'>Nueva cotización</Button>
                  </section>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        )}
      </Modal>

      <ModalCustomerConfirmDelete
        isOpen={isOpenDelete}
        onOpenChange={onOpenChangeDelete}
        onConfirm={() => {
          onOpenChangeDelete()
          onOpenChange()
          deleteCustomer()
        }}
      />

      <ModalCustomerEditAdd isOpen={isOpenEditAdd} onOpenChange={onOpenChangeEditAdd} />
    </>
  )
}

export default ModalCustomerDetails
