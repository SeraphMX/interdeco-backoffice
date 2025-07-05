import { addToast, Avatar, Badge, Button, Card, CardBody, Chip, Input, Spinner, Tooltip, useDisclosure } from '@heroui/react'
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowRightLeft,
  BrushCleaning,
  CloudAlert,
  CloudCheck,
  File,
  MailPlus,
  Minus,
  PackagePlus,
  Plus,
  Save,
  Tag,
  Trash2,
  X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ModalAddProduct from '../components/quotes/modals/ModalAddProduct'
import ModalSelectCustomer from '../components/quotes/modals/ModalSelectCustomer'

import ModalAddDiscount from '../components/quotes/modals/ModalAddDiscount'
import ModalConfirmClear from '../components/quotes/modals/ModalConfirmClear'
import ModalConfirmDeleteQuote from '../components/quotes/modals/ModalConfirmDeleteQuote'
import ModalConfirmRemoveItem from '../components/quotes/modals/ModalConfirmRemoveItem'
import CustomerIcon from '../components/shared/CustomerIcon'
import QuoteStatus from '../components/shared/QuoteStatus'
import { useDebouncedAutoSave } from '../hooks/useDebounceAutosave'
import { quoteService } from '../services/quoteService'
import { RootState } from '../store'

import { Category } from '../schemas/catalog.schema'
import {
  clearItems,
  clearQuote,
  clearSelectedCustomer,
  removeItem,
  setItems,
  setItemsLoaded,
  setQuote,
  setQuoteStatus,
  setQuoteTotal,
  setSelectedCustomer,
  setSelectedItem,
  updateItem
} from '../store/slices/quoteSlice'
import { Quote, QuoteItem } from '../types'
import { formatDate, parseISOtoRelative } from '../utils/date'

const NuevaCotizacion = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)
  const customers = useSelector((state: RootState) => state.clientes.items)
  const products = useSelector((state: RootState) => state.productos.items)

  const [taxes, setTaxes] = useState(0)
  const [subtotal, setSubtotal] = useState(0)

  const rxCategories = useSelector((state: RootState) => state.catalog.categories)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevItemsLengthRef = useRef((quote.data.items ?? []).length)

  const { isOpen: isOpenSelectCustomer, onOpen: onOpenSelectCustomer, onOpenChange: onOpenChangeSelectCustomer } = useDisclosure()
  const { isOpen: isOpenAddProduct, onOpen: onOpenAddProduct, onOpenChange: onOpenChangeAddProduct } = useDisclosure()
  const { isOpen: isOpenAddDiscount, onOpen: onOpenAddDiscount, onOpenChange: onOpenChangeAddDiscount } = useDisclosure()
  const { isOpen: isOpenConfirmRemoveItem, onOpen: onOpenConfirmRemoveItem, onOpenChange: onOpenChangeConfirmRemoveItem } = useDisclosure()
  const { isOpen: isOpenConfirmClear, onOpen: onOpenConfirmClear, onOpenChange: onOpenChangeConfirmClear } = useDisclosure()
  const {
    isOpen: isOpenConfirmDeleteQuote,
    onOpen: onOpenConfirmDeleteQuote,
    onOpenChange: onOpenChangeConfirmDeleteQuote
  } = useDisclosure()

  const { isSaving, isSaved, isDirty } = useDebouncedAutoSave(quote.data, 3000)

  const handleSaveQuote = async () => {
    if (!quote.data.id) {
      const savedQuote = await quoteService.saveQuote(quote.data)

      if (savedQuote.success) {
        if (!savedQuote) return
        dispatch(setQuote(savedQuote.quote))
        addToast({
          title: 'Cotización guardada',
          description: savedQuote.quote?.created_at ? formatDate(savedQuote.quote.created_at) : 'Fecha no disponible',
          color: 'success'
        })
      } else {
        console.error('Error al guardar la cotización:', savedQuote.error)
        addToast({
          title: 'Error al guardar',
          description: 'Hubo un error al guardar la cotización. Inténtalo de nuevo.',
          color: 'danger'
        })
      }
    }
  }

  const onSuccessSetStatus = async (quote: Quote) => {
    dispatch(setQuoteStatus(quote.status))
  }

  const handlePreviewQuote = () => {
    sessionStorage.setItem('previewQuote', JSON.stringify(quote.data))
    window.open('/cotizaciones/preview', '_blank')
  }

  const handleDeleteQuote = async () => {
    if (!quote.data.id) {
      addToast({
        title: 'Error',
        description: 'No se puede eliminar una cotización que no ha sido guardada.',
        color: 'danger'
      })
      return
    }

    if (quote.data.status === 'open') {
      const result = await quoteService.deleteQuote(quote.data)

      if (result.success) {
        dispatch(clearQuote())
        navigate('/cotizaciones')
      } else {
        console.error('Error al eliminar la cotización:', result.error)
      }
    } else {
      const updateResult = await quoteService.updateQuote({ ...quote.data, status: 'archived' })

      if (!updateResult.success) {
        console.error('Error al archivar la cotización:', updateResult.error)
        addToast({
          title: 'Error al archivar',
          description: 'Hubo un error al archivar la cotización. Inténtalo de nuevo.',
          color: 'danger'
        })
        return
      }

      addToast({
        title: 'Cotización archivada',
        description: 'La cotización ha sido archivada correctamente.',
        color: 'success'
      })
      navigate('/cotizaciones')
      dispatch(setQuote(updateResult.quote))
    }
  }

  const handleRestoreQuote = async () => {
    console.log('Restaurando cotización', quote.data.id)

    const updatedQuote = await quoteService.setQuoteStatus(quote.data.id ?? 0, 'open')

    dispatch(setQuote(updatedQuote.quote))

    addToast({
      title: 'Cotización restaurada',
      description: 'La cotización ha sido restaurada correctamente.',
      color: 'success'
    })
  }

  const handleCloseQuote = () => {
    dispatch(clearQuote())
    navigate('/cotizaciones')
  }

  const handleSendQuote = () => {
    dispatch(setQuoteStatus('sent'))
    addToast({
      title: 'Enviar cotización',
      description: 'Funcionalidad de envío de cotización aún no implementada.',
      color: 'primary'
    })
  }

  const handleSetDiscount = (item: QuoteItem) => {
    dispatch(setSelectedItem(item))

    onOpenAddDiscount()
  }

  const handleConfirmRemoveItem = (item: QuoteItem) => {
    console.log('item para eliminar', item)
    dispatch(setSelectedItem(item))
    onOpenConfirmRemoveItem()
  }

  const handleUpdateQuantity = (item: QuoteItem, newQuantity: number) => {
    const findItem = (quote.data.items ?? []).find((i) => i.product?.id === item.product?.id)
    if (findItem) {
      if (findItem.product) {
        const updatedItem: QuoteItem = quoteService.buildQuoteItem({
          ...findItem,
          requiredQuantity: newQuantity,
          product: findItem.product
        })
        dispatch(updateItem(updatedItem))
      } else {
        console.error('Product is undefined for the selected item.')
      }
    }
  }

  const handleRemoveItem = () => {
    console.log('removiendo item', quote.selectedItem?.product?.spec ?? 'Producto no definido')
    dispatch(removeItem(quote.selectedItem as QuoteItem))
    onOpenChangeConfirmRemoveItem()
  }

  const handleClearItems = () => {
    dispatch(clearItems())
    onOpenChangeConfirmClear()
  }

  useEffect(() => {
    if ((quote.data.items ?? []).length > 0) {
      setSubtotal((quote.data.items ?? []).reduce((acc, item) => acc + item.subtotal, 0))
      setTaxes((quote.data.items ?? []).reduce((acc, item) => acc + item.subtotal * 0.16, 0))
      dispatch(setQuoteTotal(subtotal + taxes))
    }
  }, [quote.data.items, subtotal, taxes, dispatch])

  useEffect(() => {
    if (quote.data.items && quote.data.items.length > prevItemsLengthRef.current) {
      // Se agregó un nuevo producto
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }

    prevItemsLengthRef.current = quote.data.items?.length || 0
  }, [quote.data.items, scrollRef])

  // useEffect modificado
  useEffect(() => {
    let isMounted = true

    // Nueva función para cargar los items de la cotización
    const loadQuoteItems = async (quoteId: number) => {
      const response = await quoteService.getQuoteItems(quoteId)

      if (response.success && response.items) {
        return response.items.map((item) => ({
          product: products.find((p) => p.id === item.product_id) || null,
          requiredQuantity: item.required_quantity || 0,
          totalQuantity: item.total_quantity || 0,
          packagesRequired: item.packages_required || 0,
          subtotal: item.subtotal || 0,
          originalSubtotal: item.original_subtotal || 0,
          discount: item.discount || 0,
          discountType: item.discount_type || 'percentage',
          id: item.id
        }))
      }
      return []
    }

    const fetchData = async () => {
      if (quote.data.id && !quote.itemsLoaded) {
        const customer = customers.find((c) => c.id == quote.data.customer_id)
        if (customer) dispatch(setSelectedCustomer(customer))

        const items = await loadQuoteItems(quote.data.id)
        if (isMounted && items.length) {
          dispatch(setItems(items as QuoteItem[]))
          dispatch(setItemsLoaded(true))
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [quote.data.id, dispatch, customers, products, quote.data.items?.length, quote.data.customer_id, quote.data.items, quote.itemsLoaded])

  return (
    <div className='container  space-y-4  h-full flex flex-col'>
      <section className='flex justify-between items-center gap-4'>
        <div className='flex items-center gap-4'>
          <Button isIconOnly variant='light' onPress={() => navigate('/cotizaciones')}>
            <ArrowLeft size={24} />
          </Button>
          <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
            {quote.data.id
              ? `Cotización #${quote.data.id}${
                  quote.data.created_at ? new Date(quote.data.created_at).getFullYear().toString().slice(-2) : '00'
                }`
              : 'Nueva Cotización'}

            {quote.data.id && <QuoteStatus quote={quote.data} onSuccess={onSuccessSetStatus} />}
          </h1>
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

      <div className=' overflow-y-auto relative rounded-xl  shadow-medium bg-white' ref={scrollRef}>
        <Card className='rounded-none'>
          <CardBody>
            <div className='space-y-5 p-2'>
              {quote.data.items?.length === 0 ? (
                <section className='flex flex-col items-center justify-center h-48 space-y-2'>
                  <PackagePlus size={48} className='mx-auto text-gray-400 ' />
                  <h2 className='text-center text-gray-600 text-lg font-medium'>No hay productos</h2>
                  <p className='text-center text-gray-500'>Agrega productos para comenzar a cotizar</p>
                </section>
              ) : (
                (quote.data.items ?? []).map((item) => {
                  const surplus = item.totalQuantity - item.requiredQuantity
                  const isExceeding = surplus > 0
                  const category = rxCategories.find(
                    (cat: Category) => item.product?.category_description && cat.description === item.product.category_description
                  )
                  const categoryColor = category?.color || 'bg-gray-300'
                  const pricePerPackage = Number(
                    ((item.product?.price ?? 0) * (1 + (item.product?.utility ?? 0) / 100) * (item.product?.package_unit ?? 1)).toFixed(2)
                  )
                  return (
                    <article key={item.product?.id} className='border rounded-lg overflow-hidden'>
                      <header className='flex items-center gap-4 p-4 bg-gray-50'>
                        <div className='flex-grow min-w-0'>
                          <h3 className='font-medium text-lg flex gap-4 items-center'>
                            {item.product?.sku} {item.product?.spec}
                            <Chip className={categoryColor} size='sm' variant='flat'>
                              {item.product?.category_description}
                            </Chip>
                          </h3>
                          <p className='text-gray-600'>{item.product?.description}</p>
                        </div>

                        {quote.data.status === 'open' && (
                          <Button
                            isIconOnly
                            color='success'
                            variant='light'
                            aria-label='Agregar descuento'
                            onPress={() => handleSetDiscount(item)}
                          >
                            <Tag size={18} />
                          </Button>
                        )}

                        <Input
                          type='number'
                          className='w-20'
                          value={item.requiredQuantity.toString()}
                          size='sm'
                          aria-label='Cantidad requerida'
                          onChange={(e) => handleUpdateQuantity(item, Number(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          isReadOnly={quote.data.status !== 'open'}
                          classNames={{ input: 'text-right' }}
                        />

                        {quote.data.status === 'open' && (
                          <Button
                            isIconOnly
                            color='danger'
                            variant='light'
                            aria-label='Eliminar artículo'
                            onPress={() => handleConfirmRemoveItem(item)}
                          >
                            <Minus size={18} />
                          </Button>
                        )}
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
                                <dt>{item.product?.measurement_unit} Requeridos</dt>
                                <dd className='text-gray-600'>{item.requiredQuantity} </dd>
                              </div>
                              {isExceeding && (
                                <div className='flex justify-between'>
                                  <dt>{item.product?.measurement_unit} Cotizados</dt>
                                  <dd className='text-gray-600'>{item.totalQuantity.toFixed(2)}</dd>
                                </div>
                              )}
                              {surplus > 0 && (
                                <div className='flex justify-between'>
                                  <dt>Excedente</dt>
                                  <dd className='text-gray-600'>
                                    {surplus.toFixed(2)} {item.product?.measurement_unit}
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
                })
              )}
              <ModalAddDiscount isOpen={isOpenAddDiscount} onOpenChange={onOpenChangeAddDiscount} />
              <ModalConfirmRemoveItem
                isOpen={isOpenConfirmRemoveItem}
                onOpenChange={onOpenChangeConfirmRemoveItem}
                onConfirm={handleRemoveItem}
              />
            </div>
          </CardBody>
        </Card>
        <footer className='sticky bottom-0 left-0 right-0  p-2 px-6 shadow-medium bg-white z-10 flex justify-between items-center '>
          {quote.data.status === 'open' && (
            <section className='flex justify-start items-center'>
              <Button size='md' color='primary' variant='light' startContent={<Plus size={18} />} onPress={onOpenAddProduct}>
                Agregar producto
              </Button>
              {(quote.data.items ?? []).length > 0 && (
                <Button size='md' color='danger' variant='light' startContent={<BrushCleaning size={18} />} onPress={onOpenConfirmClear}>
                  Limpiar productos
                </Button>
              )}
              <ModalConfirmClear isOpen={isOpenConfirmClear} onOpenChange={onOpenChangeConfirmClear} onConfirm={handleClearItems} />
              <ModalAddProduct isOpen={isOpenAddProduct} onOpenChange={onOpenChangeAddProduct} />
            </section>
          )}
          <section className='flex justify-end items-center gap-2'>
            {(quote.data.items?.length ?? 0) > 0 && (
              <>
                <Chip color='primary' className='text-sm' variant='flat' size='lg'>
                  {quote.data.items?.length ?? 0} {(quote.data.items?.length ?? 0) > 1 ? 'items' : 'item'}
                </Chip>

                {quote.data.status === 'open' && (
                  <Chip
                    color={isSaving ? 'primary' : isSaved ? 'success' : isDirty ? 'warning' : 'default'}
                    className='text-sm'
                    variant='flat'
                    size='lg'
                    startContent={
                      isSaved ? (
                        <CloudCheck size={24} />
                      ) : isSaving ? (
                        <Spinner size='sm' />
                      ) : isDirty ? (
                        <CloudAlert size={24} />
                      ) : (
                        <CloudCheck size={24} /> // opcional: ícono neutro o "guardado por default"
                      )
                    }
                  >
                    {isSaved ? 'Guardada' : isSaving ? 'Guardando...' : isDirty ? 'Sin guardar' : 'Sin cambios'}
                  </Chip>
                )}
              </>
            )}
            {quote.data.status === 'sent' && (
              <Tooltip
                content={`Fecha: 
              ${formatDate(quote.data.last_updated ?? '')}`}
              >
                <Chip className='text-sm' variant='flat' size='lg'>
                  Enviada: {quote.data.last_updated ? parseISOtoRelative(quote.data.last_updated) : 'Fecha no disponible'}
                </Chip>
              </Tooltip>
            )}
          </section>
        </footer>
      </div>

      {(quote.data.items ?? []).length > 0 && (
        <section>
          <Card className='p-4 px-8'>
            <CardBody className='flex flex-row justify-between items-center gap-4'>
              <section className='flex justify-end gap-3'>
                {!quote.data.id && (
                  <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='primary' variant='ghost' onPress={handleSaveQuote}>
                    <Save />
                    Guardar
                  </Button>
                )}
                <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='secondary' variant='ghost' onPress={handlePreviewQuote}>
                  <File />
                  Ver PDF
                </Button>
                {quote.data.id && (
                  <>
                    <Button className='flex flex-col h-16 w-16 p-2 gap-0 ' color='secondary' variant='ghost' onPress={handleSendQuote}>
                      <MailPlus />
                      Enviar
                    </Button>
                    {quote.data.status === 'open' ? (
                      <Button
                        className='flex flex-col h-16 w-16 p-2 gap-0'
                        color='danger'
                        variant='ghost'
                        onPress={onOpenConfirmDeleteQuote}
                      >
                        <Trash2 />
                        Eliminar
                      </Button>
                    ) : quote.data.status === 'archived' ? (
                      <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='primary' variant='ghost' onPress={handleRestoreQuote}>
                        <ArchiveRestore />
                        Restaurar
                      </Button>
                    ) : (
                      quote.data.status !== 'sent' && (
                        <Button
                          className='flex flex-col h-16 w-16 p-2 gap-0'
                          color='danger'
                          variant='ghost'
                          onPress={onOpenConfirmDeleteQuote}
                        >
                          <Archive />
                          Archivar
                        </Button>
                      )
                    )}
                    <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='danger' variant='ghost' onPress={handleCloseQuote}>
                      <X />
                      Cerrar
                    </Button>
                    <ModalConfirmDeleteQuote
                      isOpen={isOpenConfirmDeleteQuote}
                      onOpenChange={onOpenChangeConfirmDeleteQuote}
                      onConfirm={handleDeleteQuote}
                    />
                  </>
                )}
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
                  <span className='ml-2'>{quote.data.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
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
