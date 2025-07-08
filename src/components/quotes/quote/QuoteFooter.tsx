import { Card, CardBody } from '@heroui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BrowserView, MobileView } from 'react-device-detect'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { setQuoteTotal } from '../../../store/slices/quoteSlice'
import CountUp from '../../shared/CountUp'
import QuoteActions from './QuoteActions'

const QuoteFooter = () => {
  const dispatch = useDispatch()

  const [taxes, setTaxes] = useState(0)
  const [subtotal, setSubtotal] = useState(0)

  const quote = useSelector((state: RootState) => state.quote)

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
        <Card className='p-4 px-8 '>
          <CardBody className='flex flex-row justify-between items-center gap-4 '>
            <BrowserView>
              <QuoteActions />
            </BrowserView>

            <MobileView>
              <div className='flex items-center justify-between w-full'>
                <div className='flex-1 flex justify-end'></div>
              </div>
            </MobileView>

            {/* 

// <div className='flex justify-between w-full   items-center gap-4'>
              //   <ul className='text-sm text-gray-600 list-disc list-inside space-y-1 ml-4'>
              //     <li>Todo trabajo requiere de un 60% de anticipo, el cual se podrá pagar.</li>
              //     <li>Aceptamos pagos en efectivo, mediante depósito o transferencia electrónica a la cuenta.</li>
              //     <li>Precios sujetos a cambio sin previo aviso y sujetos a existencia.</li>
              //     <li>Una vez realizado el pedido no se aceptan cambios de material ni cancelaciones.</li>
              //     <li>Los tiempos de entrega varían dependiendo del material.</li>
              //     <li>Mejoramos cualquier presupuesto presentado por escrito.</li>
              //     <li>Trabajo 100% garantizado.</li>
              //   </ul>
              //   <img src='/branding/warranty.svg' className='w-40 ' alt='' />
              // </div> */}

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
    </footer>
  )
}

export default QuoteFooter
