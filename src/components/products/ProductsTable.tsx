import { Chip, SortDescriptor, Spinner, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { productService } from '../../services/productService'
import { RootState } from '../../store'
import { setSelectedProduct, updateProduct } from '../../store/slices/productsSlice'
import { Category, Product } from '../../types'

interface ProductsTableProps {
  wrapperHeight?: number
  filterValue?: string
  selectedCategories?: string[]
  selectedProviders?: string[]
  variant?: 'default' | 'minimal'
}

const ProductsTable = ({
  wrapperHeight,
  filterValue = '',
  selectedCategories = [],
  selectedProviders = [],
  variant = 'default'
}: ProductsTableProps) => {
  const rxProducts = useSelector((state: RootState) => state.productos.items)
  const rxCategories = useSelector((state: RootState) => state.catalog.categories)
  const loading = useSelector((state: RootState) => state.productos.loading)
  const dispatch = useDispatch()
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'public_price', direction: 'descending' })

  const filteredItems = useMemo(() => {
    console.log('Filtros activos:', { selectedCategories, selectedProviders, filterValue })

    return rxProducts.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(filterValue.toLowerCase()) ||
        (item.sku ?? '').toLowerCase().includes(filterValue.toLowerCase()) ||
        //item.category_description.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.provider_name?.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.spec?.toLowerCase().includes(filterValue.toLowerCase())

      const matchesCategories = selectedCategories.length === 0 || selectedCategories.find((c) => c === item.category.toString())
      const matchesProviders = selectedProviders.length === 0 || selectedProviders.find((p) => p === item.provider.toString())

      const matchesWithPrice = item.public_price !== undefined && (item.price ?? 0) > 0
      const matchesActive = variant !== 'minimal' || item.is_active

      return matchesSearch && matchesProviders && matchesCategories && matchesWithPrice && matchesActive
    })
  }, [rxProducts, filterValue, selectedCategories, selectedProviders, variant])

  const sortedItems = [...filteredItems].sort((a, b) => {
    const column = sortDescriptor.column
    const direction = sortDescriptor.direction

    let first = a[column as keyof typeof a]
    let second = b[column as keyof typeof b]

    // Ordenar por precio calculado manualmente
    if (column === 'public_price') {
      first = (a.price ?? 0) * (1 + (a.utility ?? 0) / 100)
      second = (b.price ?? 0) * (1 + (b.utility ?? 0) / 100)
    }

    let cmp = 0
    if (typeof first === 'number' && typeof second === 'number') {
      cmp = first - second
    } else {
      cmp = (first ?? '').toString().localeCompare((second ?? '').toString(), 'es', { sensitivity: 'base' })
    }

    return direction === 'descending' ? -cmp : cmp
  })
  const headerColumns = [
    { name: 'PRODUCTO', uid: 'spec', sortable: true },
    { name: 'PRECIO PÚBLICO', uid: 'public_price', sortable: true, align: 'end' },
    { name: 'ACTIVO', uid: 'is_active', sortable: true, hidden: variant === 'minimal' ? true : false, align: 'center' },
    { uid: 'facade' }
  ]

  const handleProductStatus = async (product: Product, status: boolean) => {
    const previous = product.is_active // Guardamos valor previo por si hay que revertir

    // 1. Optimistic update
    dispatch(updateProduct({ ...product, is_active: status }))

    try {
      // 2. Actualiza en backend
      await productService.setActiveProduct(product, status)
    } catch (error) {
      // 3. Revertir si falla
      dispatch(updateProduct({ ...product, is_active: previous }))
      console.error('Error al actualizar el estado del producto:', error)
    }
  }

  return (
    <>
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
        bottomContent={
          <footer className='text-sm bg-gray-50  text-gray-700 z-0  fixed bottom-0 left-0 right-0 flex justify-center items-center p-1'>
            <section className='container mx-auto px-6  flex justify-between items-center'>
              <div>{filteredItems.length} resultados encontrados</div>
              <div>
                {selectedCategories.length > 0
                  ? selectedCategories
                      .map((categoryId) => {
                        const category = rxCategories.find((c) => c.id === Number(categoryId))
                        return category ? category.description : ''
                      })
                      .join(', ')
                  : ''}
                {selectedCategories.length > 0 && selectedProviders.length > 0 ? ' de ' : ''}
                {selectedProviders.length > 0
                  ? selectedProviders
                      .map((providerId) => {
                        const provider = rxProducts.find((p) => p.provider === Number(providerId))
                        return provider ? provider.provider_name : ''
                      })
                      .join(', ')
                  : ''}
              </div>
            </section>
          </footer>
        }
        //selectedKeys={selectedKeys}
        className='overflow-auto'
        classNames={{
          th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600'
        }}
        onSelectionChange={(key) => {
          const selectedId = Array.from(key)[0]
          const product = rxProducts.find((p) => p.id == selectedId)
          //setSelectedKeys(key)
          dispatch(setSelectedProduct(product || null))
        }}
        shadow='none'
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              allowsSorting={column.sortable}
              hidden={column.hidden}
              align={(column.align as 'center' | 'start' | 'end' | undefined) || 'start'}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={sortedItems}
          isLoading={loading}
          loadingContent={
            <div className='bg-white/20 backdrop-blur-md w-full h-full flex justify-center items-center'>
              <Spinner label='Cargando datos...' />
            </div>
          }
        >
          {(item) => {
            const category = rxCategories.find((cat: Category) => cat.description === item.category_description)
            const categoryColor = category?.color || 'bg-gray-300'
            return (
              <TableRow key={item.id}>
                <TableCell className='w-full'>
                  <div className='min-w-xs '>
                    <div className={`${variant === 'default' ? ' text-large' : 'text-small'}`}>
                      <span className='font-bold'>{item.sku}</span> - <span className='text-gray-600'>{item.provider_name}</span>
                    </div>
                    <div className={`text-wrap ${variant === 'default' ? ' text-small' : 'text-tiny '}`}>
                      <span className='font-semibold'>{item.spec}</span> {item.description}
                    </div>
                    <div className='flex justify-between items-center mt-2'>
                      <Chip className={categoryColor} size='sm' variant='flat'>
                        {item.category_description}
                      </Chip>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={`pr-10 ${variant === 'default' ? ' text-lg' : ''}`}>
                  {item.package_unit && item.package_unit > 1
                    ? ((item.price ?? 0) * (1 + (item.utility ?? 0) / 100) * item.package_unit).toLocaleString('es-MX', {
                        style: 'currency',
                        currency: 'MXN'
                      })
                    : ((item.price ?? 0) * (1 + (item.utility ?? 0) / 100)).toLocaleString('es-MX', {
                        style: 'currency',
                        currency: 'MXN'
                      })}
                </TableCell>
                <TableCell hidden={variant === 'minimal' ? true : false} className='text-center'>
                  <Switch
                    aria-label='Status del producto'
                    isSelected={item.is_active}
                    onValueChange={(val) => handleProductStatus(item, val)}
                  />
                </TableCell>
                <TableCell>
                  <i />
                </TableCell>
              </TableRow>
            )
          }}
        </TableBody>
      </Table>
    </>
  )
}

export default ProductsTable
