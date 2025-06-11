import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Tooltip,
  useDisclosure
} from '@heroui/react'
import { ArrowLeft, ArrowRightLeft, Calculator, Minus, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ModalSelectCustomer from '../components/quotes/modals/ModalSelectCustomer'

import CustomerIcon from '../components/shared/CustomerIconB'
import { RootState } from '../store'
import { addCotizacion } from '../store/slices/cotizacionesSlice'
import { clearSelectedCustomer } from '../store/slices/quoteSlice'

const NuevaCotizacion = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const clientes = useSelector((state: RootState) => state.clientes.items)
  const materiales = useSelector((state: RootState) => state.materiales.items)
  const quote = useSelector((state: RootState) => state.quote)

  const { isOpen: isOpenSelectCustomer, onOpen: onOpenSelectCustomer, onOpenChange: onOpenChangeSelectCustomer } = useDisclosure()

  const [showCalculator, setShowCalculator] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [measurements, setMeasurements] = useState({
    largo: '',
    ancho: ''
  })

  const [formData, setFormData] = useState({
    items: [] as {
      id: string
      materialId: string
      metrosCuadrados: number
      unidadesNecesarias: number
      metrosTotales: number
      precioUnitario: number
      subtotal: number
    }[],
    subtotal: 0,
    iva: 0,
    total: 0,
    status: 'pendiente' as const
  })

  const handleSubmit = () => {
    if (!selectedClientId) return

    dispatch(
      addCotizacion({
        id: crypto.randomUUID(),
        fecha: new Date().toISOString(),
        clienteId: selectedClientId,
        ...formData,
        descuento: 0
      })
    )
    navigate('/cotizaciones')
  }

  const addItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      materialId: '',
      metrosCuadrados: 0,
      unidadesNecesarias: 0,
      metrosTotales: 0,
      precioUnitario: 0,
      subtotal: 0
    }
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    })
  }

  const calculateUnitsNeeded = (metrosCuadrados: number, material: (typeof materiales)[0]) => {
    if (material.unidadCompra === 'metro') {
      return {
        unidades: metrosCuadrados,
        metrosTotales: metrosCuadrados
      }
    }

    if (!material.metrosPorUnidad) return { unidades: 0, metrosTotales: 0 }

    // Calcular cuántas unidades (cajas o rollos) se necesitan
    const unidadesNecesarias = Math.ceil(metrosCuadrados / material.metrosPorUnidad)
    // Calcular los metros totales que se entregarán (basado en unidades completas)
    const metrosTotales = unidadesNecesarias * material.metrosPorUnidad

    return {
      unidades: unidadesNecesarias,
      metrosTotales
    }
  }

  const updateItem = (index: number, updates: Partial<(typeof formData.items)[0]>) => {
    const newItems = [...formData.items]
    const currentItem = { ...newItems[index], ...updates }

    const material = materiales.find((m) => m.id === currentItem.materialId)
    if (material) {
      // Si estamos actualizando los metros cuadrados o el material
      if ('metrosCuadrados' in updates || 'materialId' in updates) {
        const metrosCuadrados = Math.floor(currentItem.metrosCuadrados) // Asegurar que sea un número entero
        const { unidades, metrosTotales } = calculateUnitsNeeded(metrosCuadrados, material)

        currentItem.unidadesNecesarias = unidades
        currentItem.metrosTotales = metrosTotales
        currentItem.precioUnitario = material.precio
        currentItem.subtotal = unidades * material.precio
      }
    }

    newItems[index] = currentItem

    // Recalcular totales
    const subtotal = newItems.reduce((acc, item) => acc + item.subtotal, 0)
    const iva = subtotal * 0.16
    const total = subtotal + iva

    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      iva,
      total
    })
  }

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)

    // Recalcular totales
    const subtotal = newItems.reduce((acc, item) => acc + item.subtotal, 0)
    const iva = subtotal * 0.16
    const total = subtotal + iva

    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      iva,
      total
    })
  }

  const openCalculator = (index: number) => {
    setCurrentItemIndex(index)
    setMeasurements({ largo: '', ancho: '' })
    setShowCalculator(true)
  }

  const calculateSquareMeters = () => {
    if (currentItemIndex === null) return

    const largo = parseFloat(measurements.largo)
    const ancho = parseFloat(measurements.ancho)

    if (!isNaN(largo) && !isNaN(ancho)) {
      const metrosCuadrados = Math.floor(largo * ancho) // Asegurar que sea un número entero
      updateItem(currentItemIndex, { metrosCuadrados })
    }

    setShowCalculator(false)
    setCurrentItemIndex(null)
    setMeasurements({ largo: '', ancho: '' })
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <section className='flex justify-between items-center gap-4'>
        <div className='flex items-center gap-4'>
          <Button isIconOnly variant='light' onPress={() => navigate('/cotizaciones')}>
            <ArrowLeft size={24} />
          </Button>
          <h1 className='text-3xl font-bold text-gray-900'>Nueva Cotización</h1>
        </div>
        <div className='flex items-center gap-4'>
          {quote.selectedCustomer && (
            <Badge
              color='danger'
              content={<X size={12} />}
              placement='bottom-right'
              onClick={() => {
                dispatch(clearSelectedCustomer())
              }}
              className='w-5 h-5 p-0 cursor-pointer'
            >
              <Tooltip placement='left' content={quote.selectedCustomer.name}>
                <Avatar
                  isBordered
                  color='primary'
                  showFallback
                  radius='sm'
                  size='sm'
                  classNames={{ base: 'bg-primary-100', fallback: 'text-primary' }}
                  fallback={<CustomerIcon customerType={quote.selectedCustomer.customer_type} />}
                />
              </Tooltip>
            </Badge>
          )}

          <Button
            color='primary'
            variant='ghost'
            startContent={!quote.selectedCustomer ? <Plus size={18} /> : <ArrowRightLeft size={18} />}
            onPress={onOpenSelectCustomer}
          >
            {!quote.selectedCustomer ? 'Seleccionar cliente' : 'Cambiar cliente'}
          </Button>
        </div>
        <ModalSelectCustomer isOpen={isOpenSelectCustomer} onOpenChange={onOpenChangeSelectCustomer} />
      </section>

      <div className='space-y-6'>
        <Card className='p-6'>
          <CardBody className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-medium'>Materiales</h3>
              <Button size='sm' color='primary' variant='light' onPress={addItem} startContent={<Plus size={18} />}>
                Agregar Material
              </Button>
            </div>

            <div className='space-y-4'>
              {formData.items.map((item, index) => {
                const material = materiales.find((m) => m.id === item.materialId)
                return (
                  <div key={item.id}>
                    <div className='space-y-4 border-1 border-gray-100 p-2'>
                      <div className='flex justify-between items-start'>
                        <h4 className='font-medium'>Material {index + 1}</h4>
                        <Button isIconOnly color='danger' variant='light' onPress={() => removeItem(index)}>
                          <Minus size={18} />
                        </Button>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <Select
                          label='Material'
                          required
                          value={item.materialId}
                          onChange={(e) => updateItem(index, { materialId: e.target.value })}
                        >
                          <SelectItem key='empty' value=''>
                            Seleccionar material
                          </SelectItem>
                          {materiales.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.nombre}
                            </SelectItem>
                          ))}
                        </Select>

                        <div className='flex gap-2 '>
                          <Input
                            type='number'
                            label='Metros Cuadrados'
                            required
                            min='0'
                            step='1'
                            value={item.metrosCuadrados.toString()}
                            onChange={(e) => updateItem(index, { metrosCuadrados: parseInt(e.target.value) || 0 })}
                          />
                          <Button
                            size='lg'
                            isIconOnly
                            color='primary'
                            variant='flat'
                            className='self-end'
                            onPress={() => openCalculator(index)}
                          >
                            <Calculator />
                          </Button>
                        </div>
                      </div>

                      {item.materialId && material && (
                        <div className='space-y-2 text-sm text-gray-600 '>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <span className='font-medium'>Unidad de compra:</span>
                              <span className='ml-2 capitalize'>{material.unidadCompra}</span>
                            </div>
                            {material.metrosPorUnidad && (
                              <div>
                                <span className='font-medium'>Metros por {material.unidadCompra}:</span>
                                <span className='ml-2'>{material.metrosPorUnidad}</span>
                              </div>
                            )}
                          </div>
                          <div className='grid grid-cols-2 gap-4'>
                            {material.unidadCompra !== 'metro' && (
                              <div>
                                <span className='font-medium'>{material.unidadCompra === 'caja' ? 'Cajas' : 'Rollos'} necesarios:</span>
                                <span className='ml-2'>{item.unidadesNecesarias}</span>
                              </div>
                            )}
                            <div>
                              <span className='font-medium'>Metros totales:</span>
                              <span className='ml-2'>{item.metrosTotales}</span>
                            </div>
                          </div>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <span className='font-medium'>Precio por {material.unidadCompra}:</span>
                              <span className='ml-2'>
                                {material.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                              </span>
                            </div>
                            <div>
                              <span className='font-medium'>Subtotal:</span>
                              <span className='ml-2'>{item.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>

        <Card className='p-6'>
          <CardBody>
            <div className='flex flex-col gap-2 text-right'>
              <div className='text-sm'>
                <span className='font-medium'>Subtotal:</span>
                <span className='ml-2'>{formData.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
              </div>
              <div className='text-sm'>
                <span className='font-medium'>IVA:</span>
                <span className='ml-2'>{formData.iva.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
              </div>
              <div className='text-lg font-semibold'>
                <span>Total:</span>
                <span className='ml-2'>{formData.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className='flex justify-end gap-3'>
          <Button color='danger' variant='light' onPress={() => navigate('/cotizaciones')}>
            Cancelar
          </Button>
          <Button color='primary' onPress={() => setShowClientModal(true)} isDisabled={formData.items.length === 0}>
            Continuar
          </Button>
        </div>
      </div>

      {/* Modal Calculadora */}
      <Modal isOpen={showCalculator} onOpenChange={setShowCalculator} size='sm'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Calcular Metros Cuadrados</ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <Input
                    type='number'
                    label='Largo (metros)'
                    min='0'
                    step='0.01'
                    value={measurements.largo}
                    onChange={(e) => setMeasurements({ ...measurements, largo: e.target.value })}
                  />
                  <Input
                    type='number'
                    label='Ancho (metros)'
                    min='0'
                    step='0.01'
                    value={measurements.ancho}
                    onChange={(e) => setMeasurements({ ...measurements, ancho: e.target.value })}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cancelar
                </Button>
                <Button color='primary' onPress={calculateSquareMeters}>
                  Calcular
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Selección de Cliente */}
      <Modal isOpen={showClientModal} onOpenChange={setShowClientModal} size='lg'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Seleccionar Cliente</ModalHeader>
              <ModalBody>
                <Select label='Cliente' required value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                  <SelectItem key='empty' value=''>
                    Seleccionar cliente
                  </SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cancelar
                </Button>
                <Button color='primary' onPress={handleSubmit} isDisabled={!selectedClientId}>
                  Guardar Cotización
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default NuevaCotizacion
