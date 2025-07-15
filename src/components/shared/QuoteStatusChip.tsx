import { Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react'
import { useSelector } from 'react-redux'
import { quoteService } from '../../services/quoteService'
import { RootState } from '../../store'
import { Quote, QuoteStatus, quoteStatus, uiColors } from '../../types'

interface QuoteStatusProps {
  quote: Quote
  onSuccess?: (quote: Quote) => void
}

const QuoteStatusChip = ({ quote, onSuccess }: QuoteStatusProps) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const handleSetStatus = async (quote: Quote, status: QuoteStatus) => {
    if (quote.id != null) {
      const result = await quoteService.setQuoteStatus(quote.id, status, user?.id)
      if (result.success && result.quote) {
        onSuccess?.(result.quote)
      } else {
        console.error('Error al actualizar el estado de la cotización:', result.error)
      }
    } else {
      console.error('Quote ID is null or undefined.')
    }
  }

  if (!['sent', 'accepted', 'opened', 'rejected'].includes(quote.status) || !user?.role || user.role !== 'admin') {
    return (
      <Chip className='capitalize' variant='bordered' color={quoteStatus.find((s) => s.key === quote.status)?.color as uiColors}>
        {quoteStatus.find((s) => s.key === quote.status)?.label}
      </Chip>
    )
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Chip
          className='capitalize cursor-pointer'
          variant='bordered'
          color={quoteStatus.find((s) => s.key === quote.status)?.color as uiColors}
        >
          {quoteStatus.find((s) => s.key === quote.status)?.label}
        </Chip>
      </DropdownTrigger>
      <DropdownMenu
        selectionMode='single'
        aria-label='Static Actions'
        onSelectionChange={(key) => {
          const selectedKey = Array.from(key)[0]
          if (selectedKey) {
            handleSetStatus(quote, selectedKey.toString() as QuoteStatus)
          }
        }}
      >
        {quote.status !== 'accepted' ? (
          <DropdownItem key='accepted' color='primary'>
            Anticipo recibido
          </DropdownItem>
        ) : null}
        <DropdownItem key='paid' color='success'>
          Marcar como pagada
        </DropdownItem>
        {quote.status !== 'accepted' ? (
          <DropdownItem key='rejected' className='text-danger' color='danger'>
            Rechazada
          </DropdownItem>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  )
}

export default QuoteStatusChip
