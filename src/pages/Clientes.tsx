import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Selection,
  useDisclosure
} from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Edit, Plus, Search, SquareUserRound, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import CustomerDetails from '../components/customers/CustomerDetails'
import AddCustomer from '../components/forms/AddCustomer'
import { RootState } from '../store'
import { customerStatus } from '../types'

const Clientes = () => {
  //const dispatch = useDispatch()
  const clientes = useSelector((state: RootState) => state.clientes.items)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isOpen: isOpenDetails, onOpen: onOpenDetails, onOpenChange: onOpenChangeDetails } = useDisclosure()
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onOpenChange: onOpenChangeDelete } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<Selection>(new Set([]))
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const matchesSearch =
        cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        (selectedStatus instanceof Set && selectedStatus.size === 0) ||
        (selectedStatus instanceof Set && selectedStatus.has(cliente.status))

      return matchesSearch && matchesStatus
    })
  }, [clientes, searchTerm, selectedStatus])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedStatus(new Set([]))
  }

  const handleViewCustomer = (id: number) => {
    setSelectedCustomer(id)
    onOpenDetails()
    console.log(`Cliente seleccionado: ${id}`)
  }

  return (
    <div className='flex flex-col gap-4 h-full '>
      <div className='flex justify-between items-center'>
        <div className='flex flex-wrap flex-grow gap-4 '>
          <Input
            type='text'
            placeholder='Buscar clientes...'
            className='w-full sm:max-w-[300px]'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            startContent={<Search className='text-gray-400' size={20} />}
            isClearable
          />

          <Dropdown>
            <DropdownTrigger>
              <Button variant='flat' className='capitalize pl-1'>
                {selectedStatus instanceof Set && selectedStatus.size === 0 && <span className='text-sm ml-3'>Status</span>}

                {selectedStatus instanceof Set && selectedStatus.size === 1 && (
                  <span className='text-sm'>
                    {Array.from(selectedStatus).map((status) => {
                      const statusLabel = customerStatus.find((s) => s.key === status)?.label || 'Desconocido'
                      return (
                        <span key={status} className='ml-3'>
                          {statusLabel}
                        </span>
                      )
                    })}
                  </span>
                )}

                {selectedStatus instanceof Set && selectedStatus.size > 1 && (
                  <div className='flex items-center gap-1'>
                    <span className='text-sm mr-1'>Status</span>
                    <Badge color='primary' content={selectedStatus.size} placement='bottom-right' className='-right-2 -bottom-0 z-index-10'>
                      {''}
                    </Badge>
                  </div>
                )}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label='Filtrar por status'
              closeOnSelect={false}
              selectedKeys={selectedStatus}
              selectionMode='multiple'
              onSelectionChange={setSelectedStatus}
            >
              {customerStatus.map((status) => (
                <DropdownItem key={status.key}>{status.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {selectedStatus instanceof Set && selectedStatus.size > 0 ? (
            <Button variant='light' color='danger' onPress={clearFilters}>
              <X size={20} />
              Limpiar filtros
            </Button>
          ) : null}
        </div>

        <Button onPress={onOpen} color='primary' variant='ghost'>
          <Plus size={20} />
          Nuevo
        </Button>
      </div>

      <motion.section className='overflow-y-auto h-full p-4 sm:p-0'>
        <AnimatePresence>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredClientes.map((cliente) => (
              <motion.section
                key={cliente.id}
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
                  onPress={() => handleViewCustomer(cliente.id)}
                >
                  <CardHeader className='flex justify-between items-start pb-0'>
                    <section className='flex items-center gap-2 flex-grow min-w-0'>
                      {cliente.customer_type === 'individual' ? (
                        <SquareUserRound className='text-gray-500' size={24} />
                      ) : (
                        <Building2 className='text-gray-500' size={24} />
                      )}
                      <h3 className='text-lg font-semibold truncate whitespace-nowrap overflow-hidden max-w-[100px] sm:max-w-max'>
                        {cliente.name}
                      </h3>
                    </section>
                    <Chip className={`${customerStatus.find((status) => status.key === cliente.status)?.color}`}>
                      {customerStatus.find((status) => status.key === cliente.status)?.label || 'Desconocido'}
                    </Chip>
                  </CardHeader>
                  <CardBody className='text-sm text-gray-600 justify-center'>
                    <div className='space-y-2'>
                      <p className='flex items-center gap-2'>
                        <span className='font-medium'>Email:</span>
                        {cliente.email || 'No disponible'}
                      </p>
                      <p className='flex items-center gap-2'>
                        <span className='font-medium'>Teléfono:</span>
                        {cliente.phone || 'No disponible'}
                      </p>
                      {cliente.notes && (
                        <p className='flex items-center gap-2'>
                          <span className='font-medium'>Notas:</span>
                          {cliente.notes || 'Sin datos adicionales'}
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

      <Modal size='xl' isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Nuevo Cliente</ModalHeader>
              <ModalBody>
                <AddCustomer
                  onSuccess={() => {
                    onClose()
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cancelar
                </Button>
                <Button color='primary' type='submit' form='add-customer-form'>
                  Guardar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal size='xl' isOpen={isOpenDetails} onOpenChange={onOpenChangeDetails} backdrop='blur'>
        <ModalContent>
          {(onClose) => (
            <>
              {selectedCustomer !== null && <CustomerDetails idCustomer={selectedCustomer} />}
              <ModalFooter className='flex items-center justify-between'>
                <section className='flex items-center gap-2'>
                  <Button color='primary' isIconOnly variant='ghost' onPress={onOpen}>
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
      </Modal>
      <Modal size='sm' isOpen={isOpenDelete} onOpenChange={onOpenChangeDelete}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Eliminar cliente</ModalHeader>
              <ModalBody>
                <p>¿Estás seguro de que deseas eliminar este cliente? </p>
                <p className='text-red-500 font-semibold mt-2 text-sm'>
                  ¡Atención! Esta acción eliminará los datos del cliente, pero conservara el historial de cotizaciones.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color='default' variant='light' onPress={onClose}>
                  Cancelar
                </Button>
                <Button color='danger'>Eliminar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Clientes
