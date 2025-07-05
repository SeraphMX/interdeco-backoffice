import { Chip, SortDescriptor, Spinner, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { productService } from '../../services/productService'
import { RootState } from '../../store'
import { selectProductsWithCategoryName } from '../../store/selectors/catalogSelectors'
import { setSelectedProduct, updateProduct } from '../../store/slices/productsSlice'
import { Product } from '../../types'
import { calculateSellingPrice, calculateTotalPrice } from '../../utils/pricing'
import ProductsTableFooter from './ProductsTableFooter'

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
  const rxProducts = useSelector(selectProductsWithCategoryName)
  const loading = useSelector((state: RootState) => state.productos.loading)
  const isEditing = useSelector((state: RootState) => state.productos.isEditing)
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
        selectionMode={isEditing ? 'none' : 'single'}
        selectionBehavior='replace'
        disallowEmptySelection
        bottomContent={
          <ProductsTableFooter
            filteredItemsCount={filteredItems.length}
            selectedCategories={selectedCategories}
            selectedProviders={selectedProviders}
          />
        }
        className='overflow-auto z-10'
        classNames={{
          th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600'
        }}
        onSelectionChange={(key) => {
          const selectedId = Array.from(key)[0]
          const product = rxProducts.find((p) => p.id == selectedId)
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
            return (
              <TableRow key={item.id}>
                <TableCell className='w-full'>
                  <div className='min-w-xs '>
                    <div className={`${variant === 'default' ? ' text-large' : 'text-small'}`}>
                      <span className='font-bold'>{item.sku}</span> - <span className='text-gray-600'>{item.providerName}</span>
                    </div>
                    <div className={`text-wrap ${variant === 'default' ? ' text-small' : 'text-tiny '}`}>
                      <span className='font-semibold'>{item.spec}</span> {item.description}
                    </div>
                    <div className='flex justify-between items-center mt-2'>
                      <Chip className={item.categoryColor} size='sm' variant='flat'>
                        {item.categoryName}
                      </Chip>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={`pr-10 ${variant === 'default' ? ' text-lg' : ''}`}>
                  {item.package_unit && item.package_unit > 1
                    ? calculateTotalPrice(item.price, item.utility, item.package_unit)
                    : calculateSellingPrice(item.price, item.utility)}
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
