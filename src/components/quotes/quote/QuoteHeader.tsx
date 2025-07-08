import { Button } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { RootState } from '../../../store'
import { setQuoteStatus } from '../../../store/slices/quoteSlice'
import { Quote } from '../../../types'
import QuoteStatus from '../../shared/QuoteStatus'
import QuoteCustomerData from './QuoteCustomerData'

const QuoteHeader = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)

  const onSuccessSetStatus = async (quote: Quote) => {
    dispatch(setQuoteStatus(quote.status))
  }
  return (
    <header className='flex justify-between items-center gap-4'>
      {quote.isPublicAccess ? (
        <section>
          <Link to='https://interdeco.mx' className='flex items-center space-x-2 font-bold text-gray-700'>
            <img src='/branding/logo-full.svg' className='h-24' alt='logo-interdeco' />
          </Link>
        </section>
      ) : (
        <div className='flex items-center gap-4'>
          <Button isIconOnly variant='light' onPress={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </Button>
          <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
            {quote.data.id ? `Cotización #${quote.data.id}${new Date().getFullYear().toString().slice(-2)}` : 'Nueva Cotización'}

            {quote.data.id && <QuoteStatus quote={quote.data} onSuccess={onSuccessSetStatus} />}
          </h1>
        </div>
      )}

      <QuoteCustomerData />
    </header>
  )
}

export default QuoteHeader
