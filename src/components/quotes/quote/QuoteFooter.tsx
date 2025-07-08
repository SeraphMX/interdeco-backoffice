import { Button, Card, CardBody, Link, useDisclosure } from '@heroui/react'
import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BrowserView } from 'react-device-detect'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { setQuoteTotal } from '../../../store/slices/quoteSlice'
import CountUp from '../../shared/CountUp'
import QuoteActions from './QuoteActions'
import ModalPayment from './modals/ModalPayment'
import ModalTerms from './modals/ModalTerms'

const QuoteFooter = () => {
  const dispatch = useDispatch()

  const [taxes, setTaxes] = useState(0)
  const [subtotal, setSubtotal] = useState(0)

  const quote = useSelector((state: RootState) => state.quote)
  const { isOpen: isOpenPaymentModal, onOpen: onOpenPaymentModal, onOpenChange: onOpenChangePaymentModal } = useDisclosure()
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
          <CardBody className='flex flex-row justify-between items-center gap-4 '>
            <BrowserView>
              <QuoteActions />
            </BrowserView>

            <Button className='flex flex-col h-16 w-16 p-2 gap-0' color='primary' variant='ghost' onPress={onOpenPaymentModal}>
              <DollarSign />
              Pagar
            </Button>
            <ModalPayment
              isOpen={isOpenPaymentModal}
              onOpenChange={onOpenChangePaymentModal}
              onConfirm={() => console.log('Payment confirmed')}
            />

            {quote.data.items && quote.data.items.length > 0 && (
              <motion.div
                className='flex flex-col gap-2 text-right'
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
        <Link size='sm' onPress={onOpenTermsModal}>
          Ver términos
        </Link>
      )}
      <ModalTerms isOpen={isOpenTermsModal} onOpenChange={onOpenChangeTermsModal} />
    </footer>
  )
}

export default QuoteFooter
