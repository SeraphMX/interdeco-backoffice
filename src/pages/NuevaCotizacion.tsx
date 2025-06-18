import { Avatar, Badge, Button, Card, CardBody, Chip, Input, Tooltip, useDisclosure } from '@heroui/react'
import { ArrowLeft, ArrowRightLeft, Minus, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ModalAddProduct from '../components/quotes/modals/ModalAddProduct'
import ModalSelectCustomer from '../components/quotes/modals/ModalSelectCustomer'
import CustomerIcon from '../components/shared/customerIcon'
import { RootState } from '../store'
import { Category } from '../store/slices/catalogSlice'
import { clearItems, clearSelectedCustomer } from '../store/slices/quoteSlice'

const NuevaCotizacion = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const clientes = useSelector((state: RootState) => state.clientes.items)
  const quote = useSelector((state: RootState) => state.quote)
  const rxCategories = useSelector((state: RootState) => state.catalog.categorias)

  const { isOpen: isOpenSelectCustomer, onOpen: onOpenSelectCustomer, onOpenChange: onOpenChangeSelectCustomer } = useDisclosure()
  const { isOpen: isOpenAddProduct, onOpen: onOpenAddProduct, onOpenChange: onOpenChangeAddProduct } = useDisclosure()

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

    navigate('/cotizaciones')
  }

  const updateItem = (index: number, updates: Partial<(typeof formData.items)[0]>) => {
    const newItems = [...formData.items]
    const currentItem = { ...newItems[index], ...updates }

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

  const handleClearItems = () => {
    dispatch(clearItems())
  }

  // const handleItemChange = (index: number, field: string, value: number) => {
  //   const updatedItems = [...quote.items]
  //   updatedItems[index][field] = value
  //   setQuote({ ...quote, items: updatedItems })
  // }

  return (
    <div className='container  space-y-4  h-full flex flex-col'>
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

      <div className='flex-grow overflow-y-auto relative rounded-xl  shadow-medium'>
        <Card className='rounded-none'>
          <CardBody>
            <div className='space-y-5 p-2'>
              {quote.items.map((item, index) => {
                const surplus = item.totalQuantity - item.requiredQuantity
                const isExceeding = surplus > 0
                const category = rxCategories.find((cat: Category) => cat.description === item.product.category_description)
                const categoryColor = category?.color || 'bg-gray-300'
                return (
                  <article key={item.id} className='border rounded-lg overflow-hidden'>
                    <header className='flex items-center gap-4 p-4 bg-gray-50'>
                      <div className='flex-grow min-w-0'>
                        <h3 className='font-medium text-lg flex gap-4 items-center'>
                          {item.product.sku}
                          <Chip className={categoryColor} size='sm' variant='flat'>
                            {item.product.category_description}
                          </Chip>
                        </h3>
                        <p className='text-gray-600'>{item.product.description}</p>
                      </div>

                      <Input
                        type='number'
                        className='w-20'
                        value={item.requiredQuantity.toString()}
                        size='sm'
                        aria-label='Cantidad requerida'
                      />
                      <Button isIconOnly color='danger' variant='light' onPress={() => removeItem(index)} aria-label='Eliminar artículo'>
                        <Minus size={18} />
                      </Button>
                    </header>

                    <section className='border-t border-gray-200 p-4'>
                      {/* Sección de detalles */}
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <section>
                          {/* Bloque de cantidades */}
                          <h4 className='sr-only'>Detalles de cantidades</h4> {/* Título oculto solo para accesibilidad */}
                          <dl className='space-y-3'>
                            {/* Lista de definiciones */}
                            <div className='flex justify-between'>
                              <dt>{item.product.measurement_unit} Requeridos</dt>
                              <dd className='text-gray-600'>{item.requiredQuantity} </dd>
                            </div>
                            {isExceeding && (
                              <div className='flex justify-between'>
                                <dt>{item.product.measurement_unit} Cotizados</dt>
                                <dd className='text-gray-600'>{item.totalQuantity}</dd>
                              </div>
                            )}
                            {surplus > 0 && (
                              <div className='flex justify-between'>
                                <dt>Excedente</dt>
                                <dd className='text-gray-600'>
                                  {surplus.toFixed(2)} {item.product.measurement_unit}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </section>

                        <section>
                          <h4 className='sr-only'>Detalles de precios</h4>
                          <dl className='space-y-3'>
                            {isExceeding && (
                              <div className='flex justify-between'>
                                <dt className='font-medium'>Paquetes necesarios</dt>
                                <dd className='text-gray-600'>{item.packagesRequired}</dd>
                              </div>
                            )}

                            <div className='flex justify-between'>
                              <dt>Precio por paquete</dt>
                              <dd className='text-gray-600'>
                                {new Intl.NumberFormat('es-MX', {
                                  style: 'currency',
                                  currency: 'MXN',
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }).format(item.product?.price || 0)}
                              </dd>
                            </div>
                            <div className='flex justify-between'>
                              <dt className='font-medium'>Subtotal</dt>
                              <dd className='text-gray-600 font-medium'>
                                {new Intl.NumberFormat('es-MX', {
                                  style: 'currency',
                                  currency: 'MXN',
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }).format(item.subtotal || 0)}
                              </dd>
                            </div>
                          </dl>
                        </section>
                      </div>
                    </section>
                  </article>
                )
              })}
            </div>
          </CardBody>
        </Card>
        <section className='sticky bottom-0 left-0 right-0  p-2   bg-white z-10 '>
          <div className='flex justify-center items-center'>
            <Button size='md' color='primary' variant='light' startContent={<Plus size={18} />} onPress={onOpenAddProduct}>
              Agregar producto
            </Button>
            <Button size='md' color='primary' variant='light' startContent={<Plus size={18} />} onPress={handleClearItems}>
              Limpiar productos
            </Button>
            <ModalAddProduct isOpen={isOpenAddProduct} onOpenChange={onOpenChangeAddProduct} />
          </div>
        </section>
      </div>

      <section>
        <Card>
          <CardBody className='flex '>
            <div className='flex justify-end gap-3'>
              <Button color='danger' variant='light' onPress={() => navigate('/cotizaciones')}>
                Cancelar
              </Button>
              <Button color='primary' onPress={() => setShowClientModal(true)} isDisabled={formData.items.length === 0}>
                Continuar
              </Button>
            </div>
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
      </section>
    </div>
  )
}

export default NuevaCotizacion
