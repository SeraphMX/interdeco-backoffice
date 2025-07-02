import { Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react'
import { quoteService } from '../../services/quoteService'
import { Quote, quoteStatus, uiColors } from '../../types'

interface QuoteStatusProps {
  quote: Quote
  onSuccess?: (quote: Quote) => void
}

const QuoteStatus = ({ quote, onSuccess }: QuoteStatusProps) => {
  const handleSetStatus = async (quote: Quote, status: string) => {
    if (quote.id != null) {
      const result = await quoteService.setQuoteStatus(quote.id, status)
      if (result.success && result.quote) {
        onSuccess?.(result.quote)
      } else {
        console.error('Error al actualizar el estado de la cotización:', result.error)
      }
    } else {
      console.error('Quote ID is null or undefined.')
    }
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
            handleSetStatus(quote, selectedKey.toString())
          }
        }}
      >
        <DropdownItem key='accepted' color='success'>
          Aceptada
        </DropdownItem>
        <DropdownItem key='rejected' className='text-danger' color='danger'>
          Rechazada
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default QuoteStatus
