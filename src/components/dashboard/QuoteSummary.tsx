import { Button, Chip } from '@heroui/react'
import { FileSearch } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { Quote, quoteStatus, uiColors } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { getQuoteID } from '../../utils/strings'

interface QuoteSummaryProps {
  quote: Quote
  show?: 'default' | 'expiring'
}
const QuoteSummary = ({ quote, show = 'default' }: QuoteSummaryProps): JSX.Element => {
  const clientes = useSelector((state: RootState) => state.clientes.items)

  const cliente = clientes.find((c) => c.id === quote.customer_id)
  const statusConfig = quoteStatus.find((s) => s.key === quote.status)

  const handlePreviewQuote = (quote: Quote) => {
    if (quote.access_token) {
      window.open(`/cotizacion/${quote.access_token}`, '_blank')
    }
  }
  return (
    <article
      key={quote.id}
      className={`flex items-center justify-between p-4  rounded-lg  transition-colors bg-gray-50 ${show === 'expiring' ? ' border-red-200 hover:bg-red-50' : ' border-gray-200 hover:bg-gray-100'} shadow-sm border `}
    >
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-3 mb-2'>
          <span className='font-semibold text-gray-900'>#{getQuoteID(quote)}</span>
          <Chip size='sm' variant='bordered' color={statusConfig?.color as uiColors} className='capitalize'>
            {statusConfig?.label}
          </Chip>
        </div>
        <p className='font-medium text-gray-700 truncate text-lg text-left'>{cliente?.name}</p>
        <div className='flex items-center justify-between mt-2'>
          <p className='text-sm text-gray-500'>
            {quote.created_at ? formatDate(quote.created_at, { style: 'short' }) : 'Fecha no disponible'}{' '}
            {show === 'expiring' && (
              <Chip size='sm' variant='flat' color='danger'>
                {quote.daysToExpire !== undefined ? (
                  <>
                    Expira en {quote.daysToExpire} día{quote.daysToExpire > 1 ? 's' : ''}
                  </>
                ) : (
                  'Días para expirar no disponibles'
                )}
              </Chip>
            )}
          </p>
        </div>
      </div>
      <div className='ml-4 flex items-center gap-2'>
        <div className='flex flex-col items-end'>
          <p className='font-bold text-lg'>{formatCurrency(quote.total)}</p>
          <p className='text-sm'>
            {quote.total_items ?? 0} item{(quote.total_items ?? 0) > 1 && 's'}
          </p>
        </div>
        <Button
          className={`flex flex-col p-2 gap-0 h-12 w-12 items-center justify-center`}
          color='primary'
          variant='ghost'
          onPress={() => handlePreviewQuote(quote)}
          isDisabled={!quote.access_token}
          isIconOnly
        >
          <FileSearch />
        </Button>
      </div>
    </article>
  )
}

export default QuoteSummary
