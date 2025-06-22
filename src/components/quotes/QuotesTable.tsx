import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react'
import { EllipsisVertical } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { quoteStatus, uiColors } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'

interface QuotesTableProps {
  wrapperHeight?: number
  filterValue?: string
  selectedStatus?: string[]
}

const QuotesTable = ({ wrapperHeight, filterValue = '', selectedStatus = [] }: QuotesTableProps) => {
  const rxQuotes = useSelector((state: RootState) => state.quotes.items)
  //const rxCategories = useSelector((state: RootState) => state.catalog.categorias)
  const loading = useSelector((state: RootState) => state.productos.loading)
  //const dispatch = useDispatch()
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'created_at', direction: 'descending' })

  const filteredItems = useMemo(() => {
    console.log('Filtros activos:', {
      filterValue
      //selectedCategories, selectedProviders,
    })

    return rxQuotes.filter((item) => {
      const matchesSearch = (item.customer_name?.toLowerCase() ?? '').includes(filterValue.toLowerCase())
      //(item.sku ?? '').toLowerCase().includes(filterValue.toLowerCase()) ||
      //item.category_description.toLowerCase().includes(filterValue.toLowerCase()) ||
      //item.provider_name.toLowerCase().includes(filterValue.toLowerCase()) ||
      //item.spec?.toLowerCase().includes(filterValue.toLowerCase())

      const matchesStatus = selectedStatus.length === 0 || selectedStatus.find((c) => c === item.status.toString())
      //   const matchesProviders = selectedProviders.length === 0 || selectedProviders.find((p) => p === item.category.toString())

      return matchesSearch && matchesStatus //&& matchesProviders && matchesCategories && matchesWithPrice
    })
  }, [filterValue, rxQuotes, selectedStatus])

  const sortedItems = [...filteredItems].sort((a, b) => {
    const first = a[sortDescriptor.column as keyof typeof a]
    const second = b[sortDescriptor.column as keyof typeof b]
    const cmp = (first ?? '').toString() < (second ?? '').toString() ? -1 : (first ?? '').toString() > (second ?? '').toString() ? 1 : 0

    return sortDescriptor.direction === 'descending' ? -cmp : cmp
  })

  const headerColumns = [
    { name: 'FECHA', uid: 'created_at', sortable: true },
    { name: 'CLIENTE', uid: 'customer_name', sortable: true },
    { name: 'ITEMS', uid: 'items', sortable: true, align: 'center' },
    { name: 'TOTAL', uid: 'description', sortable: true, align: 'end' },
    { name: 'STATUS', uid: 'status', sortable: true },
    { name: 'ACCIONES', uid: 'actions', sortable: false }
  ]

  return (
    <Table
      isVirtualized
      color='primary'
      maxTableHeight={wrapperHeight}
      //isStriped
      aria-label='Tabla de cotizaciones'
      isHeaderSticky
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
      selectionMode='single'
      selectionBehavior='toggle'
      //selectedKeys={selectedKeys}
      classNames={{
        th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600'
      }}
      onSelectionChange={(key) => {
        // const selectedId = Array.from(key)[0]
        // const product = rxProducts.find((p) => p.id == selectedId)
        //setSelectedKeys(key)
        console.log('Selected key:', key)
        //dispatch(setSelectedProduct(product || null))
      }}
      shadow='none'
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            allowsSorting={column.sortable}
            align={(column.align as 'center' | 'start' | 'end' | undefined) || 'start'}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={sortedItems} isLoading={loading} loadingContent={<Spinner label='Cargando datos...' />}>
        {(item) => {
          //const category = rxCategories.find((cat: Category) => cat.description === item.category_description)
          //const categoryColor = category?.color || 'bg-gray-300'
          return (
            <TableRow key={item.id}>
              <TableCell className='w-32 whitespace-nowrap text-ellipsis overflow-hidden'>
                {formatDate(item.created_at ?? '', { style: 'short' })}
              </TableCell>
              <TableCell>{item.customer_name ? item.customer_name : <span className='text-gray-500'>Sin cliente asociado</span>}</TableCell>
              <TableCell>{item.total_items}</TableCell>

              <TableCell>{formatCurrency(item.total)}</TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Chip
                      className='capitalize'
                      variant='bordered'
                      color={quoteStatus.find((s) => s.key === item.status)?.color as uiColors}
                    >
                      {quoteStatus.find((s) => s.key === item.status)?.label}
                    </Chip>
                  </DropdownTrigger>
                  <DropdownMenu aria-label='Static Actions'>
                    <DropdownItem key='copy'>Aceptada</DropdownItem>
                    <DropdownItem key='delete' className='text-danger' color='danger'>
                      Rechazada
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant='light' startContent={<EllipsisVertical />} isIconOnly size='sm'></Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label='Static Actions'>
                    <DropdownItem key='copy'>Duplicar</DropdownItem>
                    {item.status === 'open' ? (
                      <DropdownItem key='delete' className='text-danger' color='danger'>
                        Eliminar
                      </DropdownItem>
                    ) : null}
                    {['success', 'rejected'].includes(item.status) ? (
                      <DropdownItem key='archive' className='text-danger' color='danger'>
                        Archivar
                      </DropdownItem>
                    ) : null}
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          )
        }}
      </TableBody>
    </Table>
  )
}

export default QuotesTable
