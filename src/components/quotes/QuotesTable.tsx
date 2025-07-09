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
  TableRow,
  useDisclosure
} from '@heroui/react'
import { EllipsisVertical } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { quoteService } from '../../services/quoteService'
import { RootState } from '../../store'
import { clearQuote, setQuote } from '../../store/slices/quoteSlice'
import { Quote, quoteStatus, uiColors } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { getQuoteID } from '../../utils/strings'
import QuoteStatus from '../shared/QuoteStatus'
import ModalConfirmDeleteQuote from './modals/ModalConfirmDeleteQuote'
import ModalConfirmOpenQuote from './modals/ModalConfirmOpenQuote'
import ModalQuoteHistory from './quote/modals/ModalQuoteHistory'

interface QuotesTableProps {
  wrapperHeight?: number
  filterValue?: string
  selectedStatus?: string[]
}

const QuotesTable = ({ wrapperHeight, filterValue = '', selectedStatus = [] }: QuotesTableProps) => {
  const navigate = useNavigate()
  const rxQuotes = useSelector((state: RootState) => state.quotes.items)
  const rxQuote = useSelector((state: RootState) => state.quote)
  const loading = useSelector((state: RootState) => state.productos.loading)
  const dispatch = useDispatch()
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'created_at', direction: 'descending' })
  const { isOpen: isOpenConfirmOpenQuote, onOpen: onOpenConfirmOpenQuote, onOpenChange: onOpenChangeConfirmOpenQuote } = useDisclosure()
  const { isOpen: isOpenQuoteHistory, onOpen: onOpenQuoteHistory, onOpenChange: onOpenChangeQuoteHistory } = useDisclosure()

  const {
    isOpen: isOpenConfirmDeleteQuote,
    onOpen: onOpenConfirmDeleteQuote,
    onOpenChange: onOpenChangeConfirmDeleteQuote
  } = useDisclosure()

  const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>(undefined)

  const filteredItems = useMemo(() => {
    return rxQuotes.filter((item) => {
      const status = item.status?.toString()
      const isArchived = status === 'archived'

      // Si el usuario no está filtrando por "archived", lo excluimos
      const shouldExcludeArchived = selectedStatus.length === 0 && isArchived

      if (shouldExcludeArchived) return false

      const matchesSearch = (item.customer_name?.toLowerCase() ?? '').includes(filterValue.toLowerCase())
      const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(status)

      return matchesSearch && matchesStatus
    })
  }, [filterValue, rxQuotes, selectedStatus])

  const sortedItems = [...filteredItems].sort((a, b) => {
    const first = a[sortDescriptor.column as keyof typeof a]
    const second = b[sortDescriptor.column as keyof typeof b]
    const cmp = (first ?? '').toString() < (second ?? '').toString() ? -1 : (first ?? '').toString() > (second ?? '').toString() ? 1 : 0

    return sortDescriptor.direction === 'descending' ? -cmp : cmp
  })

  const headerColumns = [
    { name: 'ID', uid: 'quote_id', sortable: false },
    { name: 'FECHA', uid: 'created_at', sortable: true },
    { name: 'CLIENTE', uid: 'customer_name', sortable: true },
    { name: 'ITEMS', uid: 'items', sortable: true, align: 'center' },
    { name: 'TOTAL', uid: 'description', sortable: true, align: 'end' },
    { name: 'STATUS', uid: 'status', sortable: true },
    { name: 'ACCIONES', uid: 'actions', sortable: false }
  ]

  const handleOpenQuote = (id: number) => {
    const quote = rxQuotes.find((q) => q.id === id)
    setSelectedQuote(quote)
    if (!quote) return

    if (!rxQuote.data.id && (rxQuote.data.items ?? []).length > 0) {
      onOpenConfirmOpenQuote()
      return
    }

    handleSetQuote(quote)
  }

  const handlePreviewQuote = (quote: Quote) => {
    window.open(`/cotizacion/${quote.access_token}`, '_blank')
  }

  const handleSetQuote = (quote: Quote | undefined) => {
    if (!quote) return
    dispatch(clearQuote())
    dispatch(setQuote(quote))

    navigate('/cotizaciones/nueva')
  }

  const handleDeleteQuote = async () => {
    if (!rxQuote.data) return

    if (rxQuote.data.status === 'open') {
      const result = await quoteService.deleteQuote(rxQuote.data)

      if (result.success) {
        dispatch(clearQuote())
        onOpenChangeConfirmDeleteQuote()
      } else {
        console.error('Error al eliminar la cotización:', result.error)
      }
    } else {
      if (rxQuote.data.id != null) {
        await quoteService.setQuoteStatus(rxQuote.data.id, 'archived')
        onOpenChangeConfirmDeleteQuote()
      }
    }
  }

  const handleCloneQuote = (quote: Quote) => {
    quoteService.cloneQuote(quote)
    //navigate('/cotizaciones/nueva')
  }

  const handleHistoryQuote = async (quote: Quote) => {
    const history = await quoteService.getQuoteHistory(quote)
    if (history.logs && history.logs.length > 0) {
      dispatch(setQuote({ ...quote, history: history.logs }))
      onOpenQuoteHistory()
    } else {
      console.error('No se pudo obtener el historial de la cotización')
    }
  }

  const onSuccessSetStatus = async () => {
    dispatch(clearQuote())
  }

  return (
    <>
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
        selectionBehavior='replace'
        onRowAction={(key) => handleOpenQuote(parseInt(key.toString()))}
        //selectedKeys={selectedKeys}
        classNames={{
          th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600'
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
          {(quote) => {
            return (
              <TableRow key={quote.id}>
                <TableCell className='w-16'>{quote.created_at && `${getQuoteID(quote)}`}</TableCell>
                <TableCell className='w-32 whitespace-nowrap text-ellipsis overflow-hidden'>
                  {formatDate(quote.created_at ?? '', { style: 'short' })}
                </TableCell>
                <TableCell>
                  {quote.customer_name ? quote.customer_name : <span className='text-gray-500'>Sin cliente asociado</span>}
                </TableCell>
                <TableCell>{quote.total_items}</TableCell>
                <TableCell>{formatCurrency(quote.total)}</TableCell>
                <TableCell>
                  {quote.status === 'sent' ? (
                    <QuoteStatus quote={quote} onSuccess={onSuccessSetStatus} />
                  ) : (
                    <Chip
                      className='capitalize'
                      variant='bordered'
                      color={quoteStatus.find((s) => s.key === quote.status)?.color as uiColors}
                    >
                      {quoteStatus.find((s) => s.key === quote.status)?.label}
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  <Dropdown placement='left'>
                    <DropdownTrigger>
                      <Button variant='light' startContent={<EllipsisVertical />} isIconOnly size='sm'></Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label='Static Actions'>
                      <DropdownItem key='preview' onPress={() => handlePreviewQuote(quote)}>
                        Vista previa
                      </DropdownItem>
                      <DropdownItem key='history' onPress={() => handleHistoryQuote(quote)}>
                        Historial
                      </DropdownItem>
                      <DropdownItem key='copy' onPress={() => handleCloneQuote(quote)}>
                        Duplicar
                      </DropdownItem>
                      {quote.status === 'open' ? (
                        <DropdownItem
                          key='delete'
                          className='text-danger'
                          color='danger'
                          onPress={() => {
                            dispatch(setQuote(quote))
                            onOpenConfirmDeleteQuote()
                          }}
                        >
                          Eliminar
                        </DropdownItem>
                      ) : null}
                      {['accepted', 'rejected'].includes(quote.status) ? (
                        <DropdownItem
                          key='archive'
                          className='text-danger'
                          color='danger'
                          onPress={() => {
                            dispatch(setQuote(quote))
                            onOpenConfirmDeleteQuote()
                          }}
                        >
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
      <ModalConfirmOpenQuote
        onConfirm={() => handleSetQuote(selectedQuote)}
        onOpenChange={onOpenChangeConfirmOpenQuote}
        isOpen={isOpenConfirmOpenQuote}
      />
      <ModalConfirmDeleteQuote
        onConfirm={handleDeleteQuote}
        onOpenChange={onOpenChangeConfirmDeleteQuote}
        isOpen={isOpenConfirmDeleteQuote}
      />
      <ModalQuoteHistory isOpen={isOpenQuoteHistory} onOpenChange={onOpenChangeQuoteHistory} />
    </>
  )
}

export default QuotesTable
