import { Button, Card, CardBody, CardHeader, Chip, Input, Select, SelectItem, Textarea, useDisclosure } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Save, Trash2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { ProductFormData, productSchemaUpdate } from '../../schemas/product.schema'
import { productService } from '../../services/productService'
import { RootState } from '../../store'
import { clearSelectedProduct, setIsEditing } from '../../store/slices/productsSlice'
import { measureUnits } from '../../types'
import ModalProductConfirmDelete from '../products/modals/ModalProductConfirmDelete'

const ProductEdit = () => {
  const selectedProduct = useSelector((state: RootState) => state.productos.selectedProduct)
  const isEditing = useSelector((state: RootState) => state.productos.isEditing)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure()
  const dispatch = useDispatch()

  // Get unique categories and providers

  const rxCategories = useSelector((state: RootState) => state.catalog.categories)
  const rxProviders = useSelector((state: RootState) => state.catalog.providers)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ProductFormData>({
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

  const watchPrice = watch('price')
  const watchUtility = watch('utility')

  // Calcula precio público en vivo
  const livePrice = parseFloat((watchPrice || 0).toString())
  const liveUtility = parseFloat((watchUtility || 0).toString())
  const publicPrice = livePrice * (1 + liveUtility / 100)
  const pricePerPackage = publicPrice * (selectedProduct?.package_unit ?? 1)

  const handleSave = handleSubmit(
    async (data: ProductFormData) => {
      if (!selectedProduct) return
      try {
        const updatedProduct = {
          ...selectedProduct,
          ...data,
          public_price: publicPrice,
          price: livePrice,
          utility: liveUtility
        }

        await productService.updateProduct(updatedProduct)
        console.log('Producto actualizado:', updatedProduct)
        // Después de actualizar, puedes cerrar el formulario o hacer algo más
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

  const handleClearSelectedProduct = () => {
    dispatch(clearSelectedProduct())
    dispatch(setIsEditing(false))
  }

  return (
    <form onSubmit={handleSave}>
      <Card shadow='sm'>
        <CardHeader className='flex justify-between items-center'>
          <h2 className='text-xl font-semibold'>Detalles del Producto </h2>
          <div>
            {isEditing ? (
              <>
                <Button isIconOnly color='danger' variant='light' onPress={onDeleteOpen}>
                  <Trash2 size={20} />
                </Button>

                <Button isIconOnly color='primary' variant='light' type='submit'>
                  <Save size={20} />
                </Button>
              </>
            ) : (
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
            )}

            <Button isIconOnly variant='light' onPress={handleClearSelectedProduct}>
              <X size={20} />
            </Button>

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
                <Chip className='capitalize' color='primary' size='sm' variant='flat'>
                  {selectedProduct.category_description}
                </Chip>
              </div>
            )}

            {isEditing ? (
              <Select className='max-w-xs' label='Proveedor' size='sm' {...register('provider')}>
                {rxProviders.map((provider) => (
                  <SelectItem key={String(provider.key)}>{provider.name}</SelectItem>
                ))}
              </Select>
            ) : (
              <div>
                <p className='text-sm text-gray-500'>Proveedor</p>
                <p className='font-medium'>{selectedProduct.provider_name}</p>
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
                {measureUnits.map((measure) => (
                  <SelectItem key={measure.key}>{measure.label}</SelectItem>
                ))}
              </Select>
            ) : (
              <div>
                <p className='text-sm text-gray-500'>Unidad de Medida</p>
                <p className='font-medium capitalize'>{selectedProduct.measurement_unit}</p>
              </div>
            )}

            {isEditing ? (
              <Input size='sm' label='Precio' type='number' {...register('price')} isInvalid={!!errors.price} isClearable />
            ) : (
              <div>
                <p className='text-sm text-gray-500'>Precio</p>
                <p className='font-medium'>
                  {(selectedProduct.price ?? 0).toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                  })}
                </p>
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

            <div className='colspan-2'>
              <p className='text-sm text-gray-500'>Precio público</p>
              <p className='font-medium'>
                {(isEditing ? publicPrice : (selectedProduct.price ?? 0) * (1 + (selectedProduct.utility ?? 0) / 100)).toLocaleString(
                  'es-MX',
                  {
                    style: 'currency',
                    currency: 'MXN'
                  }
                )}
                {selectedProduct.measurement_unit === 'M2' && '/m²'} |{' '}
                {(isEditing
                  ? pricePerPackage
                  : (selectedProduct.price ?? 0) * (1 + (selectedProduct.utility ?? 0) / 100) * (selectedProduct.package_unit ?? 1)
                ).toLocaleString('es-MX', {
                  style: 'currency',
                  currency: 'MXN'
                })}{' '}
                {selectedProduct.measurement_unit === 'M2' && '/caja'} <br />
                <span className='text-xs text-green-700'>
                  Anterior:{' '}
                  {(selectedProduct.public_price ?? 0).toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                  })}
                </span>
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
    </form>
  )
}

export default ProductEdit
