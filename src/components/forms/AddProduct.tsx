import { Input, Select, SelectItem, Textarea, addToast } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { supabase } from '../../lib/supabase'
import { ProductFormData, productSchemaAdd } from '../../schemas/product.schema'
import { RootState } from '../../store'
import { Product } from '../../types'

type AddProductProps = {
  onSuccess: (newProduct: Product) => void
}

//TODO: Implementar los campos de formulario para agregar un producto
const AddProduct = ({ onSuccess }: AddProductProps) => {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchemaAdd),
    mode: 'all',
    defaultValues: {
      measurement_unit: 'M2'
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
  const pricePerPackage = publicPrice * watchPackageUnit

  //TODO: Remover despues con el uso de Redux
  const measureUnits = [
    { key: 'M2', label: 'Metro cuadrado', short: 'm²' },
    { key: 'ML', label: 'Metro lineal', short: 'm' },
    { key: 'KG', label: 'Kilogramo', short: 'kg' },
    { key: 'L', label: 'Litro', short: 'L' },
    { key: 'PZ', label: 'Pieza', short: 'pz' },
    { key: 'CJ', label: 'Caja', short: 'caja' },
    { key: 'BG', label: 'Bolsa', short: 'bolsa' }
  ]

  //TODO: Remover despues con el uso de Redux
  const rxProviders = [
    { key: 1, name: 'Teknostep' },
    { key: 2, name: 'Shades' },
    { key: 3, name: 'Vertilux' }
  ]

  // Get unique categories and providers
  const rxCategories = useSelector((state: RootState) => state.catalog.categorias)

  const handleSave = handleSubmit(
    async (data) => {
      console.log('✅ Formulario válido:', data)
      // Aquí va la lógica para guardar el producto, mostrar toast, etc.

      try {
        //const { provider_name, category_description } = selectedProduct //Guarda los campos adicionales que no estan en la tabla

        const { data: inserted, error } = await supabase.from('products').insert(data).select()
        if (error) throw error

        console.log('Guardado en la base...')

        const newProduct = {
          ...inserted[0],
          provider_name: rxProviders.find((p) => p.key === data.provider)?.name || '',
          category_description: rxCategories.find((c) => c.id === data.category)?.description || ''
        }

        onSuccess?.(newProduct)

        addToast({
          title: 'Producto agregado',
          description: 'El producto se ha guardado correctamente.',
          color: 'success'
          //shouldShowTimeoutProgress: true
        })

        //setProducts((prev) => [...prev, newProduct])
        //setSelectedProduct(updatedWithExtras)
      } catch (err) {
        //setError('Error al guardar los cambios')
        console.error('Error:', err)
      }
    },
    (errors) => {
      console.warn('❌ Errores de validación:', errors)
      // Aquí puedes mostrar alertas, toast, etc.
    }
  )

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
          <SelectItem key={String(provider.key)}>{provider.name}</SelectItem>
        ))}
      </Select>

      <Input
        size='sm'
        label='Unidad de empaque'
        type='number'
        {...register('package_unit')}
        isInvalid={!!errors.package_unit}
        isClearable
      />
      <Select
        className='max-w-xs'
        label='Unidad de medida'
        size='sm'
        {...register('measurement_unit')}
        isInvalid={!!errors.measurement_unit}
      >
        {measureUnits.map((measure) => (
          <SelectItem key={measure.key}>{measure.label}</SelectItem>
        ))}
      </Select>
      <Input size='sm' label='Precio' type='number' {...register('price')} isInvalid={!!errors.price} isClearable />
      <Input size='sm' label='Utilidad' type='number' {...register('utility')} isInvalid={!!errors.utility} isClearable />
      <div className='col-span-2 text-center'>
        <p className='text-sm text-gray-500'>Precio público</p>
        <p className='font-medium'>
          {publicPrice.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN'
          })}
          /{measureUnits.find((u) => u.key === watchMeasurementUnit)?.short} |{' '}
          {pricePerPackage.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN'
          })}{' '}
          /paquete
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
