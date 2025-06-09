import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import { Edit, PlusCircle, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AddCustomer from '../components/forms/AddCustomer'
import { RootState } from '../store'
import { deleteCliente } from '../store/slices/clientesSlice'

const Clientes = () => {
  const dispatch = useDispatch()
  const clientes = useSelector((state: RootState) => state.clientes.items)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || cliente.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-gray-900'>Clientes</h1>
        <Button onPress={onOpen} color='primary' endContent={<PlusCircle size={20} />}>
          Nuevo Cliente
        </Button>
      </div>

      <div className='relative'>
        <Input
          type='text'
          placeholder='Buscar clientes...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={<Search className='text-gray-400' size={20} />}
          className='w-full'
        />
      </div>

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

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id} className='bg-white'>
            <CardHeader className='flex justify-between items-start pb-0'>
              <h3 className='text-lg font-semibold'>{cliente.nombre}</h3>
              <div className='flex gap-2'>
                <Button isIconOnly variant='light' color='primary'>
                  <Edit size={18} />
                </Button>
                <Button isIconOnly variant='light' color='danger' onClick={() => dispatch(deleteCliente(cliente.id))}>
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardBody className='text-sm text-gray-600'>
              <div className='space-y-2'>
                <p className='flex items-center gap-2'>
                  <span className='font-medium'>Contacto:</span>
                  {cliente.contacto}
                </p>
                <p className='flex items-center gap-2'>
                  <span className='font-medium'>Dirección:</span>
                  {cliente.direccion}
                </p>
                {cliente.notas && (
                  <p className='flex items-center gap-2'>
                    <span className='font-medium'>Notas:</span>
                    {cliente.notas}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Clientes
