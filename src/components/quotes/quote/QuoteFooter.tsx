import { Card, CardBody, Link, useDisclosure } from '@heroui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { setQuoteTotal } from '../../../store/slices/quoteSlice'
import CountUp from '../../shared/CountUp'
import QuoteActions from './QuoteActions'
import ModalTerms from './modals/ModalTerms'

const QuoteFooter = () => {
  const dispatch = useDispatch()

  const [taxes, setTaxes] = useState(0)
  const [subtotal, setSubtotal] = useState(0)

  const quote = useSelector((state: RootState) => state.quote)

  const { isOpen: isOpenTermsModal, onOpen: onOpenTermsModal, onOpenChange: onOpenChangeTermsModal } = useDisclosure()
  useEffect(() => {
    if ((quote.data.items ?? []).length > 0) {
      setSubtotal((quote.data.items ?? []).reduce((acc, item) => acc + item.subtotal, 0))
      setTaxes((quote.data.items ?? []).reduce((acc, item) => acc + item.subtotal * 0.16, 0))
      dispatch(setQuoteTotal(subtotal + taxes))
    }
  }, [quote.data.items, subtotal, taxes, dispatch])

  if (!quote.data) {
    return null
  }

  return (
    <footer>
      {(quote.data.items ?? []).length > 0 && (
        <Card className=' px-4 '>
          <CardBody
            className={quote.isPublicAccess || !isMobile ? 'flex gap-4 flex-row justify-between items-center' : 'flex gap-4 flex-col'}
          >
            <QuoteActions />

            {quote.data.items && quote.data.items.length > 0 && (
              <motion.div
                className={`flex flex-col gap-2 text-right ${!quote.isPublicAccess && 'order-1 sm:order-2'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className='text-lg'>
                  <span className='font-medium'>Subtotal:</span>
                  <CountUp value={subtotal} />
                </div>
                <div className='text-lg'>
                  <span className='font-medium'>IVA:</span>
                  <CountUp value={taxes} />
                </div>
                <div className='text-xl font-semibold'>
                  <span>Total:</span>
                  <span className='ml-2'>
                    <CountUp value={quote.data.total} />
                  </span>
                </div>
              </motion.div>
            )}
          </CardBody>
        </Card>
      )}
      {quote.isPublicAccess && (
        <section className='flex justify-between items-center gap-2 mt-2 '>
          <p className='text-sm text-gray-600'>&copy; InterDeco 2025</p>
          <Link size='sm' onPress={onOpenTermsModal} className='cursor-pointer text-blue-600 hover:underline'>
            Ver términos de la cotización
          </Link>
        </section>
      )}
      <ModalTerms isOpen={isOpenTermsModal} onOpenChange={onOpenChangeTermsModal} />
    </footer>
  )
}

export default QuoteFooter
