import { Button, Card, CardBody, CardHeader, Chip, Input, Select, SelectItem, Textarea, Tooltip, useDisclosure } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Edit, Save, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { productSchemaUpdate } from '../../schemas/product.schema'
import { productService } from '../../services/productService'
import { RootState } from '../../store'
import { clearSelectedProduct, setIsEditing, setSelectedProduct } from '../../store/slices/productsSlice'
import { Product } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { capitalizeFirst } from '../../utils/strings'
import ModalProductConfirmDelete from '../products/modals/ModalProductConfirmDelete'

const ProductEdit = () => {
  const selectedProduct = useSelector((state: RootState) => state.productos.selectedProduct)
  const isEditing = useSelector((state: RootState) => state.productos.isEditing)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure()
  const dispatch = useDispatch()
  const [showFormLocal, setShowFormLocal] = useState(false)

  const rxCategories = useSelector((state: RootState) => state.catalog.categories)
  const rxProviders = useSelector((state: RootState) => state.catalog.providers)
  const rxMeasureUnits = useSelector((state: RootState) => state.catalog.measureUnits)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(productSchemaUpdate),
    mode: 'all',
    defaultValues: {
      sku: selectedProduct?.sku || '',
      category: selectedProduct?.category,
      provider: selectedProduct?.provider,
      spec: selectedProduct?.spec || '',
      package_unit: selectedProduct?.package_unit || 1,
      measurement_unit: selectedProduct?.measurement_unit || 'M2',
      price: selectedProduct?.price || undefined,
      utility: selectedProduct?.utility || undefined,
      description: selectedProduct?.description || ''
    }
  })

  // actualiza el form al cambiar el producto seleccionado
  useEffect(() => {
    if (selectedProduct) {
      reset({
        sku: selectedProduct.sku || '',
        category: selectedProduct.category,
        provider: selectedProduct.provider,
        spec: selectedProduct.spec || '',
        package_unit: selectedProduct.package_unit || 1,
        measurement_unit: selectedProduct.measurement_unit || 'M2',
        price: selectedProduct.price || undefined,
        utility: selectedProduct.utility || undefined,
        description: selectedProduct.description || ''
      })
    }
  }, [selectedProduct, reset])

  const watchPrice = watch('price')
  const watchUtility = watch('utility')
  const watchPackageUnit = watch('package_unit')
  const watchMeasurementUnit = watch('measurement_unit')

  const {
    publicPrice,

    displayUnitPrice,
    displayPackagePrice,
    unitSuffix,
    packageSuffix,
    previousPrice,
    livePackageUnit,
    livePrice,
    liveUtility
  } = useMemo(() => {
    const livePrice = parseFloat((watchPrice || selectedProduct?.price || 0).toString())
    const liveUtility = parseFloat((watchUtility || selectedProduct?.utility || 0).toString())
    const livePackageUnit = parseFloat((watchPackageUnit || selectedProduct?.package_unit || 1).toString())
    const unitKey = watchMeasurementUnit || selectedProduct?.measurement_unit || ''

    const publicPrice = livePrice * (1 + liveUtility / 100)
    const pricePerPackage = publicPrice * livePackageUnit

    // Agrega este estado

    const displayUnitPrice = formatCurrency(publicPrice)

    const displayPackagePrice = formatCurrency(pricePerPackage)

    const previousPrice = formatCurrency(selectedProduct?.public_price ?? 0)

    const unitSuffix = unitKey === 'M2' ? '/m²' : unitKey === 'ML' ? '/m Lineal' : `/${capitalizeFirst(unitKey)}`
    const packageSuffix = unitKey === 'M2' ? '/caja' : '/paquete'

    return {
      publicPrice,
      displayUnitPrice,
      displayPackagePrice,
      unitSuffix,
      packageSuffix,
      previousPrice,
      livePrice,
      liveUtility,
      livePackageUnit
    }
  }, [watchPrice, watchUtility, watchPackageUnit, watchMeasurementUnit, selectedProduct])

  const handleSave = handleSubmit(
    async (data) => {
      if (!selectedProduct) return
      try {
        const updatedProduct = {
          ...selectedProduct,
          ...data,
          public_price: publicPrice,
          price: livePrice,
          utility: liveUtility
        }

        const result = await productService.updateProduct(updatedProduct)
        if (!result) throw new Error('Product update failed')
        let updateProduct: Product = result
        console.log('Producto actualizado:', updatedProduct, 'nuevo', updateProduct)

        updateProduct = {
          ...updateProduct,
          category_description: rxCategories.find((cat) => cat.id === updatedProduct.category)?.description || '',
          provider_name: rxProviders.find((provider) => provider.id === updatedProduct.provider)?.name || ''
        }

        dispatch(setSelectedProduct(updateProduct || null))
        // Después de actualizar, puedes cerrar el formulario o hacer algo más
        // dispatch(clearSelectedProduct())
        dispatch(setIsEditing(false))
      } catch (error) {
        console.error('Error al guardar el producto:', error)
      }
    },
    (errors) => {
      console.warn('❌ Errores de validación:', errors)
    }
  )

  const onDeleteProduct = async () => {
    if (!selectedProduct) return
    dispatch(clearSelectedProduct())
    dispatch(setIsEditing(false))
    onDeleteOpenChange()
  }

  const handleCloseOrCancel = () => {
    if (isEditing) {
      // Si es cancelar, desactiva modo edición de inmediato
      dispatch(setIsEditing(false))
    } else {
      // Si es cerrar, dispara animación de salida
      dispatch(clearSelectedProduct())
      setShowFormLocal(false)
    }
  }

  useEffect(() => {
    if (selectedProduct) {
      setShowFormLocal(true)
    } else {
      setShowFormLocal(false)
    }
  }, [selectedProduct])

  const onAnimationComplete = (definition: string) => {
    console.log('onAnimationComplete:', definition, 'Editing:', isEditing)
    if (definition === 'exit') {
      // Aquí actualizas el estado global sólo cuando termina la animación
      if (isEditing) {
        dispatch(setIsEditing(false))
      } else {
        dispatch(clearSelectedProduct())
      }
    }
  }

  console.log('selectedProduct en render:', selectedProduct)

  return (
    <AnimatePresence mode='wait'>
      {selectedProduct && showFormLocal && (
        <motion.form
          key='ProductEditForm'
          onSubmit={handleSave}
          className='flex flex-col gap-4 z-0'
          initial={{ opacity: 0, y: 600 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 600, transition: { duration: 0.2 } }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            velocity: 0.1,
            delay: 0.2
          }}
          onAnimationComplete={onAnimationComplete}
        >
          <Card shadow='sm'>
            <CardHeader className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold'>{isEditing ? 'Editar detalles' : 'Detalles'} del producto </h2>
              <div>
                {isEditing ? (
                  <>
                    <Tooltip content='Eliminar producto' placement='bottom'>
                      <Button isIconOnly color='danger' variant='light' onPress={onDeleteOpen}>
                        <Trash2 size={20} />
                      </Button>
                    </Tooltip>

                    <Tooltip content='Guardar cambios' placement='bottom'>
                      <Button isIconOnly color='primary' variant='light' type='submit'>
                        <Save size={20} />
                      </Button>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip content='Editar producto' placement='bottom'>
                    <Button
                      isIconOnly
                      color='primary'
                      variant='light'
                      onPress={() => {
                        dispatch(setIsEditing(true))
                      }}
                    >
                      <Edit size={20} />
                    </Button>
                  </Tooltip>
                )}

                <Tooltip content={isEditing ? 'Cancelar' : 'Cerrar'} placement='bottom'>
                  <Button isIconOnly variant='light' onPress={handleCloseOrCancel}>
                    {isEditing ? <ChevronLeft size={20} /> : <X size={20} />}
                  </Button>
                </Tooltip>

                <ModalProductConfirmDelete isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} onConfirm={onDeleteProduct} />
              </div>
            </CardHeader>
            {selectedProduct && (
              <CardBody className='grid grid-cols-5 gap-4'>
                {isEditing ? (
                  <Input size='sm' label='SKU' {...register('sku')} isInvalid={!!errors.sku} isClearable />
                ) : (
                  <div>
                    <p className='text-sm text-gray-500'>SKU</p>
                    <p className='font-medium'>{selectedProduct.sku}</p>
                  </div>
                )}
                {isEditing ? (
                  <Select className='max-w-xs' label='Categoría' size='sm' {...register('category')}>
                    {rxCategories.map((cat) => (
                      <SelectItem key={String(cat.id)}>{cat.description}</SelectItem>
                    ))}
                  </Select>
                ) : (
                  <div>
                    <p className='text-sm text-gray-500'>Categoría</p>
                    <Chip
                      className={`capitalize ${rxCategories.find((cat) => cat.id === selectedProduct.category)?.color || 'bg-gray-300'}`}
                      size='sm'
                      variant='flat'
                    >
                      {rxCategories.find((cat) => cat.id === selectedProduct.category)?.description || 'Sin categoría'}
                    </Chip>
                  </div>
                )}

                {isEditing ? (
                  <Select className='max-w-xs' label='Proveedor' size='sm' {...register('provider')}>
                    {rxProviders.map((provider) => (
                      <SelectItem key={String(provider.id)}>{provider.name}</SelectItem>
                    ))}
                  </Select>
                ) : (
                  <div>
                    <p className='text-sm text-gray-500'>Proveedor</p>
                    <p className='font-medium'>
                      {rxProviders.find((provider) => provider.id === selectedProduct.provider)?.name || 'Sin proveedor'}
                    </p>
                  </div>
                )}

                {isEditing ? (
                  <Input size='sm' label='Especificaciones' {...register('spec')} isClearable isInvalid={!!errors.spec} />
                ) : (
                  selectedProduct.spec && (
                    <div>
                      <p className='text-sm text-gray-500'>Especificaciones</p>
                      <p className='font-medium'>{selectedProduct.spec}</p>
                    </div>
                  )
                )}

                {isEditing ? (
                  <Input size='sm' label='Unidad de empaque' type='number' {...register('package_unit')} isClearable />
                ) : (
                  <div>
                    <p className='text-sm text-gray-500'>Unidad de Empaque</p>
                    <p className='font-medium capitalize'>{selectedProduct.package_unit}</p>
                  </div>
                )}

                {isEditing ? (
                  <Select className='max-w-xs' label='Unidad de medida' size='sm' {...register('measurement_unit')}>
                    {rxMeasureUnits.map((measure) => (
                      <SelectItem key={measure.key}>{capitalizeFirst(measure.name)}</SelectItem>
                    ))}
                  </Select>
                ) : (
                  <div>
                    <p className='text-sm text-gray-500'>Unidad de Medida</p>
                    <p className='font-medium capitalize'>
                      {rxMeasureUnits.find((mu) => mu.key === selectedProduct.measurement_unit)?.key || 'Sin unidad de medida'}
                    </p>
                  </div>
                )}

                {isEditing ? (
                  <Input size='sm' label='Precio' type='number' {...register('price')} isInvalid={!!errors.price} isClearable />
                ) : (
                  <div>
                    <p className='text-sm text-gray-500'>Precio</p>
                    <p className='font-medium'>{formatCurrency(selectedProduct.price)}</p>
                  </div>
                )}

                {isEditing ? (
                  <Input size='sm' label='Utilidad' type='number' {...register('utility')} isInvalid={!!errors.utility} isClearable />
                ) : (
                  <div>
                    <p className='text-sm text-gray-500'>Utilidad</p>
                    <p className='font-medium'>{selectedProduct.utility}%</p>
                  </div>
                )}

                <div className='col-span-2'>
                  <p className='text-sm text-gray-500'>Precio público</p>
                  <p className='font-medium'>
                    {displayUnitPrice} {unitSuffix}
                    {livePackageUnit > 1 && (
                      <>
                        {' '}
                        | {displayPackagePrice}
                        {packageSuffix}
                      </>
                    )}
                    <br />
                    <span className='text-xs text-green-700'>Anterior: {previousPrice}</span>
                  </p>
                </div>

                <div className='col-span-5'>
                  {isEditing ? (
                    <Textarea
                      className='w-full'
                      maxRows={2}
                      label='Descripción'
                      placeholder='Escribe los detalles sobre el producto...'
                      {...register('description')}
                      isClearable
                    />
                  ) : (
                    <>
                      <p className='text-sm text-gray-500'>Descripción</p>
                      <p>{selectedProduct.description}</p>
                    </>
                  )}
                </div>
              </CardBody>
            )}
          </Card>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

export default ProductEdit
