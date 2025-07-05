import { Button, cn, Input, Select, SelectItem } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Circle, Plus, Save, X } from 'lucide-react'
import { useEffect } from 'react'
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
  const selectedItem = useSelector((state: RootState) => state.catalog.selectedItem)

  const colors = [
    { key: 'rojo', label: 'Rojo', value: 'bg-red-300', fill: 'fill-red-300' },
    { key: 'verde', label: 'Verde', value: 'bg-green-200', fill: 'fill-green-200' },
    { key: 'azul', label: 'Azul', value: 'bg-blue-200', fill: 'fill-blue-200' },
    { key: 'amarillo', label: 'Amarillo', value: 'bg-yellow-200', fill: 'fill-yellow-200' },
    { key: 'naranja', label: 'Naranja', value: 'bg-orange-300', fill: 'fill-orange-300' },
    { key: 'morado', label: 'Morado', value: 'bg-purple-300', fill: 'fill-purple-300' },
    { key: 'ambar', label: 'Ámbar', value: 'bg-amber-300', fill: 'fill-amber-300' },
    { key: 'amarillo-claro', label: 'Amarillo claro', value: 'bg-amber-200', fill: 'fill-amber-200' },
    { key: 'purpura', label: 'Púrpura', value: 'bg-purple-200', fill: 'fill-purple-200' },
    { key: 'cielo', label: 'Cielo', value: 'bg-sky-200', fill: 'fill-sky-200' },
    { key: 'esmeralda', label: 'Esmeralda', value: 'bg-emerald-200', fill: 'fill-emerald-200' },
    { key: 'gris', label: 'Gris', value: 'bg-gray-200', fill: 'fill-gray-200' }
  ]

  const typesMap = {
    category: {
      items: rxCategories.length,
      label: 'Categorías registradas',
      placeholder: 'Agregar categoría',
      single: 'categoría'
    },
    provider: {
      items: rxProviders.length,
      label: 'Proveedores registrados',
      placeholder: 'Agregar proveedor',
      single: 'proveedor'
    },
    measureUnit: {
      items: rxMeasureUnits.length,
      label: 'Unidades registradas',
      placeholder: 'Agregar unidad',
      single: 'unidad de medida'
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

  const isEditing = (() => {
    switch (type) {
      case 'category':
        return !!categoryForm.watch('id')
      case 'provider':
        return !!providerForm.watch('id')
      case 'measureUnit':
        return !!measureUnitForm.watch('id')
      default:
        return false
    }
  })()

  const setCatalogItem = async (item: Category | Provider | MeasureUnit) => {
    try {
      if (isEditing) {
        // Actualizar
        await productService.updateCatalogItem(type, item)
      } else {
        // Agregar nuevo
        await productService.addCatalogItem(type, item)
      }
      resetForms()
    } catch (error) {
      console.error('Error al agregar elemento', error)
    }
  }

  // Handlers según formulario
  const onSubmitCategory = categoryForm.handleSubmit(async (data) => {
    setCatalogItem(data)
  })

  const onSubmitProvider = providerForm.handleSubmit(async (data) => {
    setCatalogItem(data)
  })

  const onSubmitMeasureUnit = measureUnitForm.handleSubmit(async (data) => {
    setCatalogItem(data)
  })

  const resetForms = () => {
    dispatch(setShowForm(false))

    if (type === 'category') categoryForm.reset({ description: '', color: undefined })
    if (type === 'provider') providerForm.reset({ name: '' })
    if (type === 'measureUnit') measureUnitForm.reset({ key: '', name: '', plural: '' })
  }

  const ItemButtons = () => {
    return (
      <section className='flex items-center gap-2'>
        <Button
          isIconOnly
          variant='ghost'
          onPress={() => {
            resetForms()
          }}
          color='danger'
        >
          <X />
        </Button>
        <Button isIconOnly variant='ghost' type='submit' color='primary'>
          {isEditing ? <Save /> : <Plus />}
        </Button>
      </section>
    )
  }

  const renderForm = () => {
    switch (type) {
      case 'category':
        return (
          <form className='flex items-center gap-2 my-4' onSubmit={onSubmitCategory}>
            <Input
              {...categoryForm.register('id', {
                setValueAs: (v) => (v === '' ? undefined : Number(v))
              })}
              className='hidden'
            />
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
                <SelectItem key={color.value} startContent={<Circle className={cn('w-4 h-4 text-white', color.fill)} />}>
                  {color.label}
                </SelectItem>
              )}
            </Select>
            <ItemButtons />
          </form>
        )
      case 'provider':
        return (
          <form className='flex items-center gap-2 my-4' onSubmit={onSubmitProvider}>
            <Input
              {...providerForm.register('id', {
                setValueAs: (v) => (v === '' ? undefined : Number(v))
              })}
              className='hidden'
            />
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
          <form className='flex items-center gap-2 my-4' onSubmit={onSubmitMeasureUnit}>
            <Input {...measureUnitForm.register('id')} className='hidden' />
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

  useEffect(() => {
    if (!selectedItem) return

    switch (type) {
      case 'category':
        categoryForm.reset(selectedItem as Category)
        break
      case 'provider':
        providerForm.reset(selectedItem as Provider)
        break
      case 'measureUnit':
        measureUnitForm.reset(selectedItem as MeasureUnit)
        break
    }
  }, [type, selectedItem, categoryForm, providerForm, measureUnitForm])

  return (
    <>
      {!showForm ? (
        <section className='flex justify-between items-center mx-4 mb-2'>
          <span>
            {typesMap[type].items} {typesMap[type].label}
          </span>

          <Button
            variant='ghost'
            color='primary'
            className='mb-2'
            onPress={() => {
              resetForms() // Limpia los formularios
              dispatch(setShowForm(true)) // Muestra el formulario
            }}
          >
            <Plus size={20} />
            {typesMap[type].placeholder}
          </Button>
        </section>
      ) : (
        <>
          <h4 className='text-sm text-gray-600  '>{selectedItem ? 'Editar elemento' : 'Agregar elemento'}</h4>
          {renderForm()}
        </>
      )}
    </>
  )
}

export default ConfigCatalogHandler
