import { Avatar, Badge, Button, Card, CardBody, Chip, Input, Tooltip, useDisclosure } from '@heroui/react'
import { ArrowLeft, ArrowRightLeft, File, MailPlus, Minus, Plus, Save, Tag, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ModalAddProduct from '../components/quotes/modals/ModalAddProduct'
import ModalSelectCustomer from '../components/quotes/modals/ModalSelectCustomer'

import ModalAddDiscount from '../components/quotes/modals/ModalAddDiscount'
import ModalConfirmRemoveItem from '../components/quotes/modals/ModalConfirmRemoveItem'
import CustomerIcon from '../components/shared/CustomerIcon'
import { RootState } from '../store'
import { Category } from '../store/slices/catalogSlice'
import { clearItems, clearSelectedCustomer, removeItem, setSelectedItem } from '../store/slices/quoteSlice'
import { QuoteItem } from '../types'

const NuevaCotizacion = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)
  const [taxes, setTaxes] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)
  const rxCategories = useSelector((state: RootState) => state.catalog.categorias)

  const { isOpen: isOpenSelectCustomer, onOpen: onOpenSelectCustomer, onOpenChange: onOpenChangeSelectCustomer } = useDisclosure()
  const { isOpen: isOpenAddProduct, onOpen: onOpenAddProduct, onOpenChange: onOpenChangeAddProduct } = useDisclosure()
  const { isOpen: isOpenAddDiscount, onOpen: onOpenAddDiscount, onOpenChange: onOpenChangeAddDiscount } = useDisclosure()
  const { isOpen: isOpenConfirmRemoveItem, onOpen: onOpenConfirmRemoveItem, onOpenChange: onOpenChangeConfirmRemoveItem } = useDisclosure()

  const handleSave = () => {
    navigate('/cotizaciones')
  }

  const handleSetDiscount = (item: QuoteItem) => {
    dispatch(setSelectedItem(item))

    onOpenAddDiscount()
  }

  const updateItem = () => {}
  const handleConfirmRemoveItem = (item: QuoteItem) => {
    console.log('item paara eliminar', item)
    dispatch(setSelectedItem(item))
    onOpenConfirmRemoveItem()
  }

  const handleRemoveItem = () => {
    console.log('removiendo item', quote.selectedItem?.product.spec)
    dispatch(removeItem(quote.selectedItem as QuoteItem))
    onOpenChangeConfirmRemoveItem()
  }

  const handleClearItems = () => {
    dispatch(clearItems())
  }

  useMemo(() => {
    if (quote.items.length > 0) {
      setSubtotal(quote.items.reduce((acc, item) => acc + item.subtotal, 0))
      setTaxes(quote.items.reduce((acc, item) => acc + item.subtotal * 0.16, 0))
      setTotal(subtotal + taxes)
    }
  }, [quote.items, subtotal, taxes])

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

      <div className='flex-grow overflow-y-auto relative rounded-xl  shadow-medium bg-white'>
        <Card className='rounded-none'>
          <CardBody>
            <div className='space-y-5 p-2'>
              {quote.items.map((item) => {
                const surplus = item.totalQuantity - item.requiredQuantity
                const isExceeding = surplus > 0
                const category = rxCategories.find((cat: Category) => cat.description === item.product.category_description)
                const categoryColor = category?.color || 'bg-gray-300'
                const pricePerPackage = Number(
                  ((item.product?.price ?? 0) * (1 + (item.product.utility ?? 0) / 100) * (item.product.package_unit ?? 1)).toFixed(2)
                )
                return (
                  <article key={item.id} className='border rounded-lg overflow-hidden'>
                    <header className='flex items-center gap-4 p-4 bg-gray-50'>
                      <div className='flex-grow min-w-0'>
                        <h3 className='font-medium text-lg flex gap-4 items-center'>
                          {item.product.sku} {item.product.spec}
                          <Chip className={categoryColor} size='sm' variant='flat'>
                            {item.product.category_description}
                          </Chip>
                        </h3>
                        <p className='text-gray-600'>{item.product.description}</p>
                      </div>

                      <Button
                        isIconOnly
                        color='success'
                        variant='light'
                        aria-label='Agregar descuento'
                        onPress={() => handleSetDiscount(item)}
                      >
                        <Tag size={18} />
                      </Button>

                      <ModalAddDiscount isOpen={isOpenAddDiscount} onOpenChange={onOpenChangeAddDiscount} />

                      <Input
                        type='number'
                        className='w-24'
                        value={item.requiredQuantity.toString()}
                        size='sm'
                        aria-label='Cantidad requerida'
                      />

                      <Button
                        isIconOnly
                        color='danger'
                        variant='light'
                        aria-label='Eliminar artículo'
                        onPress={() => handleConfirmRemoveItem(item)}
                      >
                        <Minus size={18} />
                      </Button>

                      <ModalConfirmRemoveItem
                        isOpen={isOpenConfirmRemoveItem}
                        onOpenChange={onOpenChangeConfirmRemoveItem}
                        onConfirm={handleRemoveItem}
                      />
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
                                <dd className='text-gray-600'>{item.totalQuantity.toFixed(2)}</dd>
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
                                }).format(pricePerPackage)}
                              </dd>
                            </div>
                            <div className='flex justify-between'>
                              <dt className={`${!item.discount && 'font-medium'}`}>Subtotal</dt>
                              <dd className={`${!item.discount && 'font-medium text-lg'} text-gray-600 `}>
                                {new Intl.NumberFormat('es-MX', {
                                  style: 'currency',
                                  currency: 'MXN',
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }).format(item.discount ? item.originalSubtotal ?? 0 : item.subtotal ?? 0)}
                              </dd>
                            </div>

                            {(item.discount ?? 0) > 0 && (
                              <>
                                <div className='flex justify-between'>
                                  <dt className='flex items-center gap-2'>
                                    Descuento
                                    <Chip color='success' classNames={{ base: 'text-xs' }} size='sm' variant='flat'>
                                      {item.discountType === 'percentage' ? item.discount : 'Fijo'}
                                      {item.discountType === 'percentage' && '%'}
                                    </Chip>
                                  </dt>
                                  <dd className='text-gray-600'>
                                    -
                                    {new Intl.NumberFormat('es-MX', {
                                      style: 'currency',
                                      currency: 'MXN',
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    }).format(
                                      item.discountType === 'percentage'
                                        ? (item.originalSubtotal ?? 0) * ((item.discount ?? 0) / 100)
                                        : item.discount ?? 0
                                    )}
                                  </dd>
                                </div>

                                <div className='flex justify-between'>
                                  <dt className='font-medium'>Subtotal</dt>
                                  <dd className='text-gray-600 font-medium text-lg'>
                                    {new Intl.NumberFormat('es-MX', {
                                      style: 'currency',
                                      currency: 'MXN',
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    }).format(item.subtotal || 0)}
                                  </dd>
                                </div>
                              </>
                            )}
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
            {quote.items.length > 0 && (
              <Button size='md' color='primary' variant='light' startContent={<Plus size={18} />} onPress={handleClearItems}>
                Limpiar productos
              </Button>
            )}
            <ModalAddProduct isOpen={isOpenAddProduct} onOpenChange={onOpenChangeAddProduct} />
          </div>
        </section>
      </div>

      {quote.items.length > 0 && (
        <section>
          <Card className='p-4 px-8'>
            <CardBody className='flex flex-row justify-between items-center gap-4'>
              <section className='flex justify-end gap-3'>
                <Button
                  className='flex flex-col h-16 w-16 p-2 gap-0'
                  color='danger'
                  variant='ghost'
                  onPress={() => navigate('/cotizaciones')}
                >
                  <X />
                  Cancelar
                </Button>
                <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='primary' variant='ghost' onPress={handleSave}>
                  <Save />
                  Guardar
                </Button>
                <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='secondary' variant='ghost'>
                  <File />
                  Ver PDF
                </Button>
                <Button className='flex flex-col h-16 w-16 p-2 gap-0 ' color='secondary' variant='ghost'>
                  <MailPlus />
                  Enviar
                </Button>
              </section>
              <div className='flex flex-col gap-2 text-right'>
                <div className='text-lg'>
                  <span className='font-medium'>Subtotal:</span>
                  <span className='ml-2'>{subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                </div>
                <div className='text-lg'>
                  <span className='font-medium'>IVA:</span>
                  <span className='ml-2'>{taxes.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                </div>
                <div className='text-xl font-semibold'>
                  <span>Total:</span>
                  <span className='ml-2'>{total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>
      )}
    </div>
  )
}

export default NuevaCotizacion
