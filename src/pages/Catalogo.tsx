import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Selection,
  SelectItem,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure
} from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, ImportIcon, Plus, Save, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import AddProduct from '../components/forms/AddProduct'
import { supabase } from '../lib/supabase'
import { ProductFormData, productSchema } from '../schemas/product.schema'
import { RootState } from '../store'
import { Product } from '../types'

const Catalogo = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterValue, setFilterValue] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Selection>(new Set([]))
  const [selectedProviders, setSelectedProviders] = useState<Selection>(new Set([]))
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'category_description', direction: 'ascending' })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const prevProductRef = useRef<Product | null>(null)
  const [wrapperHeight, setwrapperHeight] = useState(0)

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'all'
  })

  const {
    register,
    handleSubmit,
    watch,
    control,
    getValues,
    formState: { isDirty, errors }
  } = form

  const watchPrice = watch('price')
  const watchUtility = watch('utility')

  // Calcula precio público en vivo
  const livePrice = parseFloat((watchPrice || 0).toString())
  const liveUtility = parseFloat((watchUtility || 0).toString())
  const publicPrice = livePrice * (1 + liveUtility / 100)
  const pricePerPackage = publicPrice * (selectedProduct?.package_unit ?? 1)

  useEffect(() => {
    fetchProducts()

    const handleResize = () => {
      // Forzar actualización cuando la ventana cambia de tamaño
      if (wrapperRef.current && wrapperRef.current.offsetHeight > 0) {
        setwrapperHeight(0)
      }
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setwrapperHeight(entry.contentRect.height)
        console.log('Altura del div actualizada:', entry.contentRect.height)
      }
    })

    // Observar cambios en el div
    if (wrapperRef.current) {
      observer.observe(wrapperRef.current)
    }

    // Añadir listener para resize de ventana
    window.addEventListener('resize', handleResize)

    return () => {
      // Limpieza
      if (wrapperRef.current) {
        observer.unobserve(wrapperRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    console.log(selectedProduct)

    if (selectedProduct) {
      form.reset(selectedProduct)
    }

    const wasVisible = prevProductRef.current !== null
    const isVisible = selectedProduct !== null

    prevProductRef.current = selectedProduct

    setIsEditing(false) // Reset editing state when product changes

    if (isVisible !== wasVisible) {
      setwrapperHeight(0)

      // Fuerza una nueva medición después de que el DOM se actualice
      const timer = setTimeout(() => {
        if (wrapperRef.current && wrapperRef.current.offsetHeight > 0) {
          setwrapperHeight(wrapperRef.current.offsetHeight)
        }
      }, 50) // Pequeño delay para permitir el re-render

      return () => clearTimeout(timer)
    }
  }, [selectedProduct, form])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('product_details_view').select('*')

      if (error) throw error

      console.log('Data:', data)

      setProducts(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar los productos')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = handleSubmit(async (data) => {
    console.log('Guardando cambios...')

    if (!selectedProduct) return

    if (!isDirty) {
      console.log('Sin cambios para guardar')
      //setIsEditing(false)
      return
    }

    try {
      console.log('Datos a guardar:', data)

      const { provider_name, category_description } = selectedProduct //Guarda los campos adicionales que no estan en la tabla

      const { data: updated, error } = await supabase.from('products').update(data).eq('id', selectedProduct.id).select()
      if (error) throw error

      const updatedWithExtras = {
        ...updated[0],
        provider_name,
        category_description
      }

      setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? { ...p, ...updatedWithExtras } : p)))
      setSelectedProduct(updatedWithExtras)
    } catch (err) {
      setError('Error al guardar los cambios')
      console.error('Error:', err)
    }
  })

  const handleDelete = async () => {
    if (!selectedProduct) return
    try {
      const { error } = await supabase.from('product_details_view').delete().eq('id', selectedProduct.id)

      if (error) throw error

      // Remove the deleted product from the local state
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id))
      setSelectedProduct(null)
    } catch (err) {
      setError('Error al eliminar el producto')
      console.error('Error:', err)
    }
  }

  // Get unique categories and providers
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category_description))), [products])

  const rxCategories = useSelector((state: RootState) => state.catalog.categorias)

  const providers = useMemo(() => Array.from(new Set(products.map((p) => p.provider_name))), [products])

  const headerColumns = [
    { name: 'SKU', uid: 'sku', sortable: true },
    { name: 'CATEGORÍA', uid: 'category_description', sortable: true },
    { name: 'PROVEEDOR', uid: 'provider_name', sortable: true },
    { name: 'DESCRIPCIÓN', uid: 'description', sortable: true },
    { name: 'PRECIO PÚBLICO', uid: 'public_price', sortable: true }
  ]

  const filteredItems = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(filterValue.toLowerCase()) ||
        (item.sku ?? '').toLowerCase().includes(filterValue.toLowerCase()) ||
        item.category_description.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.provider_name.toLowerCase().includes(filterValue.toLowerCase())

      const matchesCategories = (selectedCategories as Set<string>).size === 0 || selectedCategories.has(item.category_description)

      const matchesProviders = selectedProviders.size === 0 || selectedProviders.has(item.provider_name)

      const matchesPriceRange =
        (!priceRange.min || (item.public_price ?? 0) >= parseFloat(priceRange.min)) &&
        (!priceRange.max || (item.public_price ?? 0) <= parseFloat(priceRange.max))

      return matchesSearch && matchesCategories && matchesProviders && matchesPriceRange
    })
  }, [products, filterValue, selectedCategories, selectedProviders, priceRange])

  const sortedItems = [...filteredItems].sort((a, b) => {
    const first = a[sortDescriptor.column as keyof typeof a]
    const second = b[sortDescriptor.column as keyof typeof b]
    const cmp = first < second ? -1 : first > second ? 1 : 0

    return sortDescriptor.direction === 'descending' ? -cmp : cmp
  })

  const clearFilters = () => {
    setFilterValue('')
    setSelectedCategories(new Set([]))
    setSelectedProviders(new Set([]))
    setPriceRange({ min: '', max: '' })
  }

  if (error) {
    return <div className='text-center text-danger p-4'>{error}</div>
  }

  const measureUnits = [
    { key: 'M2', label: 'Metro cuadrado' },
    { key: 'ML', label: 'Metro lineal' },
    { key: 'KG', label: 'Kilogramo' },
    { key: 'L', label: 'Litro' },
    { key: 'PZ', label: 'Pieza' },
    { key: 'CJ', label: 'Caja' },
    { key: 'BG', label: 'Bolsa' }
  ]

  const rxProviders = [
    { key: 1, name: 'Teknostep' },
    { key: 2, name: 'Shades' },
    { key: 3, name: 'Vertilux' }
  ]

  return (
    <div className='flex flex-col gap-4 h-full'>
      <div className='flex justify-between items-center '>
        {/* Filtros */}
        <div className='flex flex-wrap flex-grow gap-4 '>
          <Input
            isClearable
            className='w-full sm:max-w-[300px]'
            placeholder='Buscar en catálogo...'
            startContent={<Search className='text-gray-400' size={20} />}
            value={filterValue}
            onClear={() => setFilterValue('')}
            onValueChange={setFilterValue}
          />

          <Dropdown>
            <DropdownTrigger>
              <Button variant='flat' className='capitalize'>
                Categorías ({selectedCategories.size})
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label='Filtrar por categorías'
              closeOnSelect={false}
              selectedKeys={selectedCategories}
              selectionMode='multiple'
              onSelectionChange={setSelectedCategories}
            >
              {categories.map((category) => (
                <DropdownItem key={category}>{category}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <Button variant='flat' className='capitalize'>
                Proveedores ({selectedProviders.size})
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label='Filtrar por proveedores'
              closeOnSelect={false}
              selectedKeys={selectedProviders}
              selectionMode='multiple'
              onSelectionChange={setSelectedProviders}
            >
              {providers.map((provider) => (
                <DropdownItem key={provider}>{provider}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* <div className='flex gap-2 items-center'>
          <Input
            type='number'
            placeholder='Precio min'
            className='w-28'
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
          />
          <span>-</span>
          <Input
            type='number'
            placeholder='Precio max'
            className='w-28'
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
          />
        </div> */}

          {/* <Slider
          className='max-w-20'
          defaultValue={[100, 500]}
          formatOptions={{ style: 'currency', currency: 'USD' }}
          label='Price Range'
          maxValue={1000}
          minValue={0}
          step={50}
        /> */}

          {selectedCategories.size > 0 || selectedProviders.size > 0 || priceRange.min || priceRange.max ? (
            <Button variant='light' color='danger' onPress={clearFilters}>
              <X size={20} />
              Limpiar filtros
            </Button>
          ) : null}
        </div>
        <div className='flex gap-2'>
          <Button color='primary' variant='ghost' onPress={onOpen}>
            <Plus size={20} />
            Nuevo
          </Button>
          <Button color='secondary' variant='ghost'>
            <ImportIcon size={20} />
            Importar
          </Button>
        </div>
      </div>

      {selectedProduct && (
        <form onSubmit={handleSave}>
          <Card shadow='sm'>
            <CardHeader className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold'>Detalles del Producto </h2>
              <div>
                {isEditing ? (
                  <>
                    <Button isIconOnly color='danger' variant='light'>
                      <Trash2 size={20} />
                    </Button>
                    <Button isIconOnly color='primary' variant='light' type='submit'>
                      <Save size={20} />
                    </Button>
                  </>
                ) : (
                  <Button isIconOnly color='primary' variant='light' onPress={() => setIsEditing(true)}>
                    <Edit size={20} />
                  </Button>
                )}

                <Button isIconOnly variant='light' onPress={() => setSelectedProduct(null)}>
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
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

              {/* {isEditing ? (
                <Input size='sm' label='Precio mayoreo' type='number' {...register('wholesale_price')} isClearable />
              ) : (
                <div>
                  <p className='text-sm text-gray-500'>Precio mayoreo</p>
                  <p className='font-medium'>
                    {selectedProduct.wholesale_price?.toLocaleString('es-MX', {
                      style: 'currency',
                      currency: 'MXN'
                    }) || 'N/A'}
                  </p>
                </div>
              )} */}

              {isEditing ? (
                <Input size='sm' label='Precio' type='number' {...register('price')} isInvalid={!!errors.public_price} isClearable />
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
                <Input size='sm' label='Utilidad' type='number' {...register('utility')} isInvalid={!!errors.public_price} isClearable />
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
          </Card>
        </form>
      )}

      <div ref={wrapperRef} className='flex flex-col flex-1 shadow-small rounded-lg '>
        <Table
          isVirtualized
          color='primary'
          maxTableHeight={wrapperHeight}
          //isStriped
          aria-label='Tabla de catálogo'
          isHeaderSticky
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          selectionMode='single'
          selectionBehavior='toggle'
          //selectedKeys={selectedKeys}
          className='overflow-auto'
          classNames={{
            th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600'
          }}
          onSelectionChange={(key) => {
            const selectedId = Array.from(key)[0]
            const product = products.find((p) => p.id == selectedId)
            //setSelectedKeys(key)
            setSelectedProduct(product || null)
          }}
          shadow='none'
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn key={column.uid} allowsSorting={column.sortable}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={sortedItems} isLoading={loading} loadingContent={<Spinner label='Cargando datos...' />}>
            {(item) => {
              const category = rxCategories.find((cat) => cat.description === item.category_description)
              const categoryColor = category?.color || 'bg-gray-300'
              return (
                <TableRow key={item.id}>
                  <TableCell className='max-w-32 whitespace-nowrap text-ellipsis overflow-hidden'>{item.sku}</TableCell>
                  <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>
                    <Chip className={categoryColor} size='sm' variant='flat'>
                      {item.category_description}
                    </Chip>
                  </TableCell>
                  <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>{item.provider_name}</TableCell>
                  <TableCell className='w-1/2 max-w-md whitespace-nowrap text-ellipsis overflow-hidden'>{item.description}</TableCell>
                  <TableCell>
                    {((item.price ?? 0) * (1 + (item.utility ?? 0) / 100)).toLocaleString('es-MX', {
                      style: 'currency',
                      currency: 'MXN'
                    })}
                  </TableCell>
                </TableRow>
              )
            }}
          </TableBody>
        </Table>
      </div>
      <div className='text-sm bg-white text-gray-500 '>{filteredItems.length} resultados encontrados</div>

      <Modal size='xl' isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Agregar producto</ModalHeader>
              <ModalBody>
                <AddProduct
                  onSuccess={(product) => {
                    console.log('Producto agregado:', product)

                    console.log(products)

                    setProducts((prev) => [...prev, product])
                    setSelectedProduct(product)

                    onClose()
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Close
                </Button>
                <Button type='submit' form='add-product-form' color='primary'>
                  Guardar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Catalogo
