import { Button, cn, Input, Select, SelectItem } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Circle, Plus, Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Category, categorySchema, MeasureUnit, measureUnitSchema, Provider, providerSchema } from '../../schemas/catalog.schema'
import { productService } from '../../services/productService'
import { RootState } from '../../store'
import { setShowForm } from '../../store/slices/catalogSlice'

type AddCatalogItemProps = {
  type: 'category' | 'provider' | 'measureUnit'
}

const ConfigCatalogHandler = ({ type }: AddCatalogItemProps) => {
  const dispatch = useDispatch()
  const rxCategories = useSelector((state: RootState) => state.catalog.categories)
  const rxProviders = useSelector((state: RootState) => state.catalog.providers)
  const rxMeasureUnits = useSelector((state: RootState) => state.catalog.measureUnits)
  const showForm = useSelector((state: RootState) => state.catalog.showForm)

  const colors = [
    { key: 'rojo', label: 'Rojo', value: 'bg-red-300' },
    { key: 'verde', label: 'Verde', value: 'bg-green-300' },
    { key: 'azul', label: 'Azul', value: 'bg-blue-300' },
    { key: 'amarillo', label: 'Amarillo', value: 'bg-yellow-300' },
    { key: 'naranja', label: 'Naranja', value: 'bg-orange-300' },
    { key: 'morado', label: 'Morado', value: 'bg-purple-300' }
  ]

  const fillColors: Record<'rojo' | 'verde' | 'azul' | 'amarillo' | 'naranja' | 'morado', string> = {
    rojo: 'fill-red-300',
    verde: 'fill-green-300',
    azul: 'fill-blue-300',
    amarillo: 'fill-yellow-300',
    naranja: 'fill-orange-300',
    morado: 'fill-purple-300'
  }

  const typesMap = {
    category: {
      items: rxCategories.length,
      label: 'Categorías registradas',
      placeholder: 'Agregar categoría'
    },
    provider: {
      items: rxProviders.length,
      label: 'Proveedores registrados',
      placeholder: 'Agregar proveedor'
    },
    measureUnit: {
      items: rxMeasureUnits.length,
      label: 'Unidades registradas',
      placeholder: 'Agregar unidad'
    }
  }

  // Formularios
  const categoryForm = useForm<Category>({
    resolver: zodResolver(categorySchema),
    defaultValues: { description: '', color: undefined },
    mode: 'onSubmit'
  })

  const providerForm = useForm<Provider>({
    resolver: zodResolver(providerSchema),
    defaultValues: { name: '' },
    mode: 'onSubmit'
  })

  const measureUnitForm = useForm<MeasureUnit>({
    resolver: zodResolver(measureUnitSchema),
    defaultValues: { key: '', name: '', plural: '' },
    mode: 'onSubmit'
  })

  const addCatalogItem = async (item: Category | Provider | MeasureUnit) => {
    try {
      await productService.addCatalogItem(type, item)

      switch (type) {
        case 'category':
          categoryForm.reset()
          break
        case 'provider':
          providerForm.reset()
          break
        case 'measureUnit':
          measureUnitForm.reset()
          break
      }

      dispatch(setShowForm(false))
    } catch (error) {
      console.error('Error al agregar elemento', error)
    }
  }

  // Handlers según formulario
  const onSubmitCategory = categoryForm.handleSubmit(async (data) => {
    addCatalogItem(data)
  })

  const onSubmitProvider = providerForm.handleSubmit(async (data) => {
    addCatalogItem(data)
  })

  const onSubmitMeasureUnit = measureUnitForm.handleSubmit(async (data) => {
    addCatalogItem(data)
  })

  const ItemButtons = () => {
    return (
      <section className='flex items-center gap-2'>
        <Button isIconOnly variant='ghost' onPress={() => dispatch(setShowForm(false))} color='danger'>
          <X />
        </Button>
        <Button isIconOnly variant='ghost' type='submit' color='primary'>
          <Save />
        </Button>
      </section>
    )
  }

  const renderForm = () => {
    switch (type) {
      case 'category':
        return (
          <form className='flex items-center gap-2 m-4' onSubmit={onSubmitCategory}>
            <Input
              label='Nombre de la categoría'
              isClearable
              size='sm'
              autoFocus
              {...categoryForm.register('description')}
              isInvalid={!!categoryForm.formState.errors.description}
            />
            <Select
              className='max-w-xs'
              items={colors}
              label='Color'
              size='sm'
              {...categoryForm.register('color')}
              isInvalid={!!categoryForm.formState.errors.color}
            >
              {(color) => (
                <SelectItem
                  key={color.value}
                  startContent={<Circle className={cn('w-4 h-4 text-white', fillColors[color.key as keyof typeof fillColors])} />}
                >
                  {color.label}
                </SelectItem>
              )}
            </Select>
            <ItemButtons />
          </form>
        )
      case 'provider':
        return (
          <form className='flex items-center gap-2 m-4' onSubmit={onSubmitProvider}>
            <Input
              label='Nombre del proveedor'
              isClearable
              size='sm'
              autoFocus
              {...providerForm.register('name')}
              isInvalid={!!providerForm.formState.errors.name}
            />

            <ItemButtons />
          </form>
        )
      case 'measureUnit':
        return (
          <form className='flex items-center gap-2 m-4' onSubmit={onSubmitMeasureUnit}>
            <Input
              label='Clave'
              className='max-w-20'
              isClearable
              size='sm'
              maxLength={3}
              autoFocus
              {...measureUnitForm.register('key', {
                setValueAs: (v) => (typeof v === 'string' ? v.toUpperCase() : '')
              })}
              isInvalid={!!measureUnitForm.formState.errors.key}
            />
            <Input
              label='Nombre'
              isClearable
              size='sm'
              {...measureUnitForm.register('name')}
              isInvalid={!!measureUnitForm.formState.errors.name}
            />
            <Input
              label='Plural'
              isClearable
              size='sm'
              {...measureUnitForm.register('plural')}
              isInvalid={!!measureUnitForm.formState.errors.plural}
            />

            <ItemButtons />
          </form>
        )
      default:
        return null
    }
  }

  return (
    <>
      {!showForm ? (
        <section className='flex justify-between items-center mx-4 mb-2'>
          <span>
            {typesMap[type].items} {typesMap[type].label}
          </span>

          <Button variant='ghost' color='primary' className='mb-2' onPress={() => dispatch(setShowForm(true))}>
            <Plus size={20} />
            {typesMap[type].placeholder}
          </Button>
        </section>
      ) : (
        renderForm()
      )}
    </>
  )
}

export default ConfigCatalogHandler
