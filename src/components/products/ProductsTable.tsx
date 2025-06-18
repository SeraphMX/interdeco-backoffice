import { Chip, SortDescriptor, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from '@heroui/react'
import { CircleHelp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { Category } from '../../store/slices/catalogSlice'
import { setSelectedProduct } from '../../store/slices/productsSlice'

interface ProductsTableProps {
  wrapperHeight?: number
  filterValue?: string
  selectedCategories?: string[]
  selectedProviders?: string[]
}

const ProductsTable = ({ wrapperHeight, filterValue = '', selectedCategories = [], selectedProviders = [] }: ProductsTableProps) => {
  const rxProducts = useSelector((state: RootState) => state.productos.items)
  const rxCategories = useSelector((state: RootState) => state.catalog.categorias)
  const loading = useSelector((state: RootState) => state.productos.loading)
  const dispatch = useDispatch()
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'category_description', direction: 'ascending' })

  const filteredItems = useMemo(() => {
    console.log('Filtros activos:', { selectedCategories, selectedProviders, filterValue })

    return rxProducts.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(filterValue.toLowerCase()) ||
        (item.sku ?? '').toLowerCase().includes(filterValue.toLowerCase()) ||
        //item.category_description.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.provider_name.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.spec?.toLowerCase().includes(filterValue.toLowerCase())

      const matchesCategories = selectedCategories.length === 0 || selectedCategories.find((c) => c === item.category.toString())
      const matchesProviders = selectedProviders.length === 0 || selectedProviders.find((p) => p === item.category.toString())

      const matchesWithPrice = item.public_price !== undefined && item.public_price > 0

      return matchesSearch && matchesProviders && matchesCategories && matchesWithPrice
    })
  }, [rxProducts, filterValue, selectedCategories, selectedProviders])

  const sortedItems = [...filteredItems].sort((a, b) => {
    const first = a[sortDescriptor.column as keyof typeof a]
    const second = b[sortDescriptor.column as keyof typeof b]
    const cmp = (first ?? '').toString() < (second ?? '').toString() ? -1 : (first ?? '').toString() > (second ?? '').toString() ? 1 : 0

    return sortDescriptor.direction === 'descending' ? -cmp : cmp
  })

  const headerColumns = [
    { name: 'ESPECIFICACIÓN', uid: 'spec', sortable: true },
    { name: 'SKU', uid: 'sku', sortable: true, hidden: true },
    { name: 'CATEGORÍA', uid: 'category_description', hidden: true },
    { name: 'PROVEEDOR', uid: 'provider_name', hidden: true },
    { name: 'DESCRIPCIÓN', uid: 'description', hidden: true },
    { name: 'PRECIO PÚBLICO', uid: 'public_price', sortable: true, align: 'end' },
    { name: 'INFO', uid: 'info' }
  ]

  return (
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
      <TableBody items={sortedItems} isLoading={loading} loadingContent={<Spinner label='Cargando datos...' />}>
        {(item) => {
          const category = rxCategories.find((cat: Category) => cat.description === item.category_description)
          const categoryColor = category?.color || 'bg-gray-300'
          return (
            <TableRow key={item.id}>
              <TableCell className='max-w-32 whitespace-nowrap text-ellipsis overflow-hidden' hidden>
                {item.sku}
              </TableCell>
              <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden' hidden>
                <Chip className={categoryColor} size='sm' variant='flat'>
                  {item.category_description}
                </Chip>
              </TableCell>
              <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden' hidden>
                {item.provider_name}
              </TableCell>
              <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>{item.spec}</TableCell>
              <TableCell className='w-1/2 max-w-md whitespace-nowrap text-ellipsis overflow-hidden' hidden>
                {item.description}
              </TableCell>
              <TableCell>
                {((item.price ?? 0) * (1 + (item.utility ?? 0) / 100)).toLocaleString('es-MX', {
                  style: 'currency',
                  currency: 'MXN'
                })}
              </TableCell>
              <TableCell>
                <Tooltip
                  className='max-w-xs'
                  placement='left'
                  content={
                    <div className='px-1 py-2 min-w-xs '>
                      <div className='text-small font-bold'>{item.sku}</div>
                      <div className='text-tiny'>{item.description}</div>
                      <div className='flex justify-between items-center mt-2'>
                        <Chip className={categoryColor} size='sm' variant='flat'>
                          {item.category_description}
                        </Chip>
                        {item.provider_name}
                      </div>
                    </div>
                  }
                >
                  <CircleHelp size={24} className='text-gray-500 cursor-help focus:outline-none focus:ring-0' tabIndex={-1} />
                </Tooltip>
              </TableCell>
            </TableRow>
          )
        }}
      </TableBody>
    </Table>
  )
}

export default ProductsTable
