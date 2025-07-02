import { Button, Chip, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from '@heroui/react'
import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { customerService } from '../../services/customerService'
import { RootState } from '../../store'
import { clearQuote, setQuote } from '../../store/slices/quoteSlice'
import { Quote, quoteStatus, uiColors } from '../../types'
import { formatDate } from '../../utils/date'

const CustomerHistory = () => {
  const customer = useSelector((state: RootState) => state.clientes.selectedCustomer)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [quoteHistory, setQuoteHistory] = useState<Quote[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const getQuoteHistory = async () => {
      setLoading(true)
      if (customer) {
        const quotes = await customerService.getCustomerQuotes(customer)
        if (quotes) {
          setQuoteHistory(quotes)
        } else {
          setQuoteHistory([])
        }
        setLoading(false)
      }
    }
    getQuoteHistory()
  }, [customer])

  const handleViewQuote = (quote: Quote) => {
    if (!quote) return
    dispatch(clearQuote())
    dispatch(setQuote(quote))
    navigate('/cotizaciones/nueva')
  }

  return (
    <Table
      aria-label='Categorias de productos'
      selectionMode='single'
      isHeaderSticky
      classNames={{
        th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600',
        base: 'max-h-[400px] overflow-auto shadow-small rounded-xl'
      }}
    >
      <TableHeader
        columns={[
          { key: 'date', label: 'Fecha', sortable: true },
          { key: 'amount', label: 'Monto', align: 'end', sortable: true },
          { key: 'status', label: 'Status', align: 'center', sortable: true },
          { key: 'actions', label: 'Acciones', align: 'center' }
        ]}
      >
        {(column) => (
          <TableColumn key={column.key} align={(column.align as 'center' | 'start' | 'end' | undefined) || 'start'}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={quoteHistory}
        isLoading={loading}
        loadingContent={<Spinner label='Cargando historial de cotizaciones...' />}
        emptyContent='No hay cotizaciones disponibles'
      >
        {(quote) => (
          <TableRow key={quote.id}>
            <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>
              {quote.created_at ? formatDate(quote.created_at, { style: 'short' }) : 'Fecha no disponible'}
            </TableCell>
            <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>
              {quote.total.toLocaleString('es-MX', {
                style: 'currency',
                currency: 'MXN'
              })}
            </TableCell>
            <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>
              <Chip
                variant='solid'
                color={quoteStatus.find((s) => s.key === quote.status)?.color as uiColors}
                className='text-xs font-medium capitalize'
              >
                {quoteStatus.find((s) => s.key === quote.status)?.label}
              </Chip>
            </TableCell>

            <TableCell>
              <Tooltip content='Ver cotización' placement='left'>
                <Button isIconOnly variant='light' color='secondary' onPress={() => handleViewQuote(quote)}>
                  <Eye size={20} />
                </Button>
              </Tooltip>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default CustomerHistory
