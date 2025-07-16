import {
  Button,
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
import { BrowserView, isMobile, MobileView } from 'react-device-detect'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { quoteService } from '../../services/quoteService'
import { RootState } from '../../store'
import { clearQuote, setQuote } from '../../store/slices/quoteSlice'
import { Quote } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { getQuoteID } from '../../utils/strings'
import QuoteStatusChip from '../shared/QuoteStatusChip'
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
  const { user } = useSelector((state: RootState) => state.auth)
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
    const column = sortDescriptor.column
    const direction = sortDescriptor.direction

    let first = a[column as keyof typeof a]
    let second = b[column as keyof typeof b]

    //Ordenar por total
    if (column === 'total') {
      first = typeof first === 'number' ? first : parseFloat(first as string)
      second = typeof second === 'number' ? second : parseFloat(second as string)
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
    { name: 'ID', uid: 'quote_id', sortable: false },
    { name: 'FECHA', uid: 'created_at', sortable: true, hidden: isMobile ? true : false },
    { name: 'CLIENTE', uid: 'customer_name', sortable: true, hidden: isMobile ? true : false },
    { name: 'ITEMS', uid: 'total_items', sortable: true, align: 'center', hidden: isMobile ? true : false },
    { name: 'TOTAL', uid: 'total', sortable: true, align: 'end', hidden: isMobile ? true : false },
    { name: 'STATUS', uid: 'status', sortable: true, hidden: isMobile ? true : false },
    { name: 'ACCIONES', uid: 'actions', sortable: false, hidden: isMobile ? true : false }
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
    quoteService.cloneQuote(quote, user?.id)
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
          th: `bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600 ${isMobile && 'hidden'}`,
          wrapper: isMobile ? 'p-0' : 'p-4'
        }}
        shadow='none'
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              allowsSorting={column.sortable}
              align={(column.align as 'center' | 'start' | 'end' | undefined) || 'start'}
              hidden={column.hidden}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={sortedItems} isLoading={loading} loadingContent={<Spinner label='Cargando datos...' />}>
          {(quote) => {
            return (
              <TableRow key={quote.id}>
                <TableCell
                  //className='w-16'
                  className={isMobile ? 'w-full pb-2' : 'w-16'}
                >
                  <BrowserView>{quote.created_at && `${getQuoteID(quote)}`}</BrowserView>
                  <MobileView>
                    <article
                      key={quote.id}
                      className={`flex items-center justify-between rounded-lg p-4 transition-colors bg-gray-50 border-gray-200 hover:bg-gray-100 shadow-sm border `}
                    >
                      <div className='flex-1 min-w-0 max-w-[200px]'>
                        <div className='flex items-center gap-3 mb-2'>
                          <span className='font-semibold text-gray-900 text-lg'>#{getQuoteID(quote)}</span>
                          <QuoteStatusChip quote={quote} onSuccess={onSuccessSetStatus} />
                        </div>
                        <p
                          className={`font-medium  truncate text-lg text-left ${quote.customer_name ? 'text-gray-700' : 'text-gray-400'} `}
                        >
                          {quote.customer_name ?? 'Sin cliente'}
                        </p>
                      </div>
                      <div className='ml-4 flex items-center gap-2'>
                        <div className='flex flex-col items-end'>
                          <p className='font-bold '>{formatCurrency(quote.total)}</p>
                          <p className='text-sm'>
                            {quote.total_items ?? 0} item{(quote.total_items ?? 0) > 1 && 's'}
                          </p>
                        </div>
                      </div>
                    </article>
                  </MobileView>
                </TableCell>
                <TableCell className='w-32 whitespace-nowrap text-ellipsis overflow-hidden' hidden={isMobile}>
                  {formatDate(quote.created_at ?? '', { style: 'short' })}
                </TableCell>
                <TableCell hidden={isMobile}>
                  {quote.customer_name ? quote.customer_name : <span className='text-gray-500'>Sin cliente asociado</span>}
                </TableCell>
                <TableCell hidden={isMobile}>{quote.total_items}</TableCell>
                <TableCell hidden={isMobile}>{formatCurrency(quote.total)}</TableCell>
                <TableCell hidden={isMobile}>
                  <QuoteStatusChip quote={quote} onSuccess={onSuccessSetStatus} />
                </TableCell>
                <TableCell hidden={isMobile}>
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
                      {['paid', 'rejected'].includes(quote.status) ? (
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
