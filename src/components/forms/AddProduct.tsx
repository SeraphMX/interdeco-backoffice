import { Input, Select, SelectItem, Textarea } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { productSchemaAdd } from '../../schemas/product.schema'
import { productService } from '../../services/productService'
import { RootState } from '../../store'
import { Product } from '../../types'
import { formatCurrency } from '../../utils/currency'

type AddProductProps = {
  onSuccess: (newProduct: Product) => void
}

const AddProduct = ({ onSuccess }: AddProductProps) => {
  const form = useForm({
    resolver: zodResolver(productSchemaAdd),
    mode: 'all',
    defaultValues: {
      measurement_unit: 'M2',
      package_unit: 1,
      price: undefined,
      utility: undefined,
      sku: '',
      spec: '',
      category: undefined,
      provider: undefined,
      description: ''
    }
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = form

  const watchPrice = watch('price')
  const watchUtility = watch('utility')
  const watchPackageUnit = watch('package_unit')
  const watchMeasurementUnit = watch('measurement_unit')

  // Calcula precio público en vivo
  const livePrice = parseFloat((watchPrice || 0).toString())
  const liveUtility = parseFloat((watchUtility || 0).toString())
  const publicPrice = livePrice * (1 + liveUtility / 100)
  const pricePerPackage = publicPrice * parseFloat(watchPackageUnit?.toString() || '1')

  // Get unique categories and providers
  const rxCategories = useSelector((state: RootState) => state.catalog.categories)
  const rxProviders = useSelector((state: RootState) => state.catalog.providers)
  const measureUnits = useSelector((state: RootState) => state.catalog.measureUnits)

  const handleSave = handleSubmit(
    async (data) => {
      console.log('✅ Formulario válido:', data)
      // Aquí va la lógica para guardar el producto, mostrar toast, etc.

      const createProduct: Product = {
        ...data,
        price: parseFloat(data.price.toString()),
        utility: parseFloat(data.utility.toString()),
        package_unit: parseFloat((data.package_unit ?? 1).toString()),
        measurement_unit: data.measurement_unit,
        sku: data.sku.trim(),
        spec: data.spec?.trim() || '',
        description: data.description?.trim() || '',
        provider: parseInt(data.provider.toString(), 10),
        category: parseInt(data.category.toString(), 10)
      }

      console.log(createProduct)

      const newProduct = await productService.createProduct(createProduct)
      if (newProduct) {
        console.log('Producto creado exitosamente:', newProduct)
        onSuccess(newProduct) //
      } else {
        console.error('Error al crear el producto')
      }
    },
    (errors) => {
      console.warn('❌ Errores de validación:', errors)
      // Aquí puedes mostrar alertas, toast, etc.
    }
  )

  const selectedUnitKey = measureUnits.find((u) => u.key === watchMeasurementUnit)?.key
  const selectedUnitName = measureUnits.find((u) => u.key === watchMeasurementUnit)?.name

  const isSingleUnit = parseFloat(watchPackageUnit?.toString() || '1') <= 1

  const getFormattedUnit = () => {
    switch (selectedUnitKey) {
      case 'M2':
        return 'm²'
      case 'ML':
        return 'm lineal'
      case 'KG':
        return 'Kg'
      default:
        return (selectedUnitName ?? '').toLowerCase()
    }
  }

  const unitLabel = isSingleUnit ? `/${getFormattedUnit()}` : `/${getFormattedUnit()} | ${formatCurrency(pricePerPackage)}`

  return (
    <form id='add-product-form' className='grid sm:grid-cols-2 gap-4' onSubmit={handleSave}>
      <Input size='sm' label='SKU' {...register('sku')} isInvalid={!!errors.sku} isClearable />
      <Input size='sm' label='Especificaciones' {...register('spec')} isClearable isInvalid={!!errors.spec} />

      <Select className='max-w-xs' label='Categoría' size='sm' isInvalid={!!errors.category} {...register('category')}>
        {rxCategories.map((cat) => (
          <SelectItem key={String(cat.id)}>{cat.description}</SelectItem>
        ))}
      </Select>
      <Select className='max-w-xs' label='Proveedor' size='sm' isInvalid={!!errors.provider} {...register('provider')}>
        {rxProviders.map((provider) => (
          <SelectItem key={String(provider.id)}>{provider.name}</SelectItem>
        ))}
      </Select>

      <Input
        size='sm'
        label='Unidad de empaque'
        type='number'
        {...register('package_unit')}
        isInvalid={!!errors.package_unit}
        isClearable
        min={1}
      />
      <Select
        className='max-w-xs'
        label='Unidad de medida'
        size='sm'
        {...register('measurement_unit')}
        isInvalid={!!errors.measurement_unit}
        disallowEmptySelection
      >
        {measureUnits.map((measure) => (
          <SelectItem key={measure.key}>{measure.name}</SelectItem>
        ))}
      </Select>
      <Input size='sm' label='Precio' type='number' {...register('price')} isInvalid={!!errors.price} isClearable />
      <Input size='sm' label='Utilidad' type='number' {...register('utility')} isInvalid={!!errors.utility} isClearable />
      <div className='col-span-2 text-center'>
        <p className='text-sm text-gray-500'>Precio público</p>
        <p className='font-medium'>
          {formatCurrency(publicPrice)}
          {unitLabel}
        </p>
      </div>
      <Textarea
        className='col-span-2'
        maxRows={2}
        label='Descripción'
        placeholder='Escribe los detalles sobre el producto...'
        {...register('description')}
        isInvalid={!!errors.description}
        isClearable
      />
    </form>
  )
}

export default AddProduct
