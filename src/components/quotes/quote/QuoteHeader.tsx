import { Button } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { MobileView } from 'react-device-detect'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { RootState } from '../../../store'
import { clearQuote, setQuoteStatus } from '../../../store/slices/quoteSlice'
import { Quote } from '../../../types'
import { getQuoteID } from '../../../utils/strings'
import QuoteStatusChip from '../../shared/QuoteStatusChip'
import QuoteActions from './QuoteActions'
import QuoteCustomerData from './QuoteCustomerData'

const QuoteHeader = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)

  const onSuccessSetStatus = async (quote: Quote) => {
    dispatch(setQuoteStatus(quote.status))
  }

  const handleBack = () => {
    if (quote.data.status !== 'open') {
      dispatch(clearQuote())
    }
    navigate(-1)
  }
  return (
    <header className={`flex justify-between items-center gap-4 flex-col sm:flex-row`}>
      {quote.isPublicAccess ? (
        <section className='flex items-center justify-between w-full sm:w-auto gap-4'>
          <Link to='https://interdeco.mx' className='flex items-center space-x-2 font-bold text-gray-700'>
            <img src='/branding/logo-full.svg' className='h-20 sm:h-24' alt='logo-interdeco' />
          </Link>
          <MobileView>
            <QuoteActions type='header' />
          </MobileView>
        </section>
      ) : (
        <div className='flex items-center gap-2'>
          <Button isIconOnly variant='light' onPress={handleBack}>
            <ArrowLeft size={24} />
          </Button>
          <h1 className='text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2'>
            {quote.data.id ? `Cotización #${getQuoteID(quote.data)}` : 'Nueva Cotización'}

            {quote.data.id && <QuoteStatusChip quote={quote.data} onSuccess={onSuccessSetStatus} />}
          </h1>
        </div>
      )}

      <QuoteCustomerData />
    </header>
  )
}

export default QuoteHeader
