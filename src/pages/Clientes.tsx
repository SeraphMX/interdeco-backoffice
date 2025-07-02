import { Button, Card, CardBody, CardHeader, Chip, useDisclosure } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Plus, SquareUserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CustomerFilters from '../components/customers/CustomerFilters'
import ModalCustomerDetails from '../components/customers/modals/ModalCustomerDetails'
import ModalCustomerEditAdd from '../components/customers/modals/ModalCustomerEditAdd'
import { RootState } from '../store'
import { clearSelectedCustomer, setSelectedCustomer } from '../store/slices/customersSlice'
import { Customer, customerStatus } from '../types'

const Clientes = () => {
  const dispatch = useDispatch()
  const clientes = useSelector((state: RootState) => state.clientes.items)
  const { isOpen: isOpenDetails, onOpen: onOpenDetails, onOpenChange: onOpenChangeDetails } = useDisclosure()
  const { isOpen: isOpenEditAdd, onOpen: onOpenEditAdd, onOpenChange: onOpenChangeEditAdd } = useDisclosure()

  const [filterValue, setFilterValue] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])

  const filteredClientes = useMemo(() => {
    return clientes.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(filterValue.toLowerCase()) ||
        customer.email?.toLowerCase().includes(filterValue.toLowerCase())
      const matchesStatus = selectedStatus.length === 0 || (customer.status && selectedStatus.includes(customer.status))

      return matchesSearch && matchesStatus
    })
  }, [clientes, filterValue, selectedStatus])

  const handleViewCustomer = (customer: Customer) => {
    dispatch(setSelectedCustomer(customer))
    onOpenDetails()
  }

  const handleCloseDetails = () => {
    dispatch(clearSelectedCustomer())
  }

  return (
    <div className='flex flex-col gap-4 h-full '>
      <header className='flex justify-between items-center'>
        <CustomerFilters
          filters={{
            search: {
              value: filterValue,
              setValue: setFilterValue
            },
            status: {
              value: selectedStatus,
              setValue: setSelectedStatus
            }
          }}
        />
        <Button onPress={onOpenEditAdd} color='primary' variant='ghost'>
          <Plus size={20} />
          Nuevo
        </Button>
      </header>

      <motion.section className='overflow-y-auto h-full p-4 sm:p-0'>
        <AnimatePresence>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredClientes.map((customer) => (
              <motion.section
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                layout
                className=' shadow-md rounded-md'
              >
                <Card
                  className='bg-white h-full w-full cursor-pointer'
                  shadow='none'
                  radius='sm'
                  isPressable
                  onPress={() => handleViewCustomer(customer)}
                >
                  <CardHeader className='flex justify-between items-start pb-0'>
                    <section className='flex items-center gap-2 flex-grow min-w-0'>
                      {customer.customer_type === 'individual' ? (
                        <SquareUserRound className='text-gray-500' size={24} />
                      ) : (
                        <Building2 className='text-gray-500' size={24} />
                      )}
                      <h3 className='text-lg font-semibold truncate whitespace-nowrap overflow-hidden max-w-[100px] sm:max-w-max'>
                        {customer.name}
                      </h3>
                    </section>
                    <Chip className={`${customerStatus.find((status) => status.key === customer.status)?.color}`}>
                      {customerStatus.find((status) => status.key === customer.status)?.label || 'Desconocido'}
                    </Chip>
                  </CardHeader>
                  <CardBody className='text-sm text-gray-600 justify-center'>
                    <div className='space-y-2'>
                      <p className='flex items-center gap-2'>
                        <span className='font-medium'>Email:</span>
                        {customer.email || 'No disponible'}
                      </p>
                      <p className='flex items-center gap-2'>
                        <span className='font-medium'>Teléfono:</span>
                        {customer.phone || 'No disponible'}
                      </p>
                      {customer.notes && (
                        <p className='flex items-center gap-2'>
                          <span className='font-medium'>Notas:</span>
                          {customer.notes || 'Sin datos adicionales'}
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </motion.section>
            ))}
          </div>
        </AnimatePresence>
      </motion.section>

      <ModalCustomerEditAdd isOpen={isOpenEditAdd} onOpenChange={onOpenChangeEditAdd} />
      <ModalCustomerDetails isOpen={isOpenDetails} onOpenChange={onOpenChangeDetails} onClose={handleCloseDetails} />
    </div>
  )
}

export default Clientes
