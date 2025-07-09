import { Avatar, Badge, Button, useDisclosure } from '@heroui/react'
import { motion } from 'framer-motion'
import { ArrowRightLeft, Plus, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { clearSelectedCustomer } from '../../../store/slices/quoteSlice'
import CustomerIcon from '../../shared/CustomerIcon'
import ModalSelectCustomer from '../modals/ModalSelectCustomer'

const QuoteCustomerData = () => {
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)
  const { isOpen: isOpenSelectCustomer, onOpen: onOpenSelectCustomer, onOpenChange: onOpenChangeSelectCustomer } = useDisclosure()

  return (
    <section>
      <div className='flex items-center gap-4 flex-col sm:flex-row '>
        {quote.selectedCustomer && (
          <div className='flex items-center gap-4 w-full sm:w-auto'>
            <motion.div
              className='flex-1 flex flex-col items-start justify-end gap-2 '
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {quote.isPublicAccess && (
                <p className='text-2xl font-bold text-right '>{`Cotización #${quote.data.id}${new Date().getFullYear().toString().slice(-2)}`}</p>
              )}
              <p className='text-sm sm:text-lg'>{quote.selectedCustomer.name || 'Cliente no seleccionado'}</p>
            </motion.div>
            {!quote.isPublicAccess && (
              <Badge
                color='danger'
                content={<X size={12} />}
                placement='bottom-right'
                onClick={() => {
                  dispatch(clearSelectedCustomer())
                }}
                className={`w-5 h-5 p-0 cursor-pointer ${quote.data.status !== 'open' && 'hidden'}`}
              >
                <Avatar
                  isBordered
                  color='primary'
                  showFallback
                  radius='sm'
                  size='sm'
                  classNames={{ base: 'bg-primary-100', fallback: 'text-primary' }}
                  fallback={<CustomerIcon customerType={quote.selectedCustomer.customer_type} />}
                />
              </Badge>
            )}
          </div>
        )}

        {quote.data.status === 'open' && !quote.isPublicAccess && (
          <Button
            color='primary'
            variant='ghost'
            startContent={!quote.selectedCustomer ? <Plus size={18} /> : <ArrowRightLeft size={18} />}
            onPress={onOpenSelectCustomer}
          >
            {!quote.selectedCustomer ? 'Seleccionar cliente' : 'Cambiar cliente'}
          </Button>
        )}
      </div>

      <ModalSelectCustomer isOpen={isOpenSelectCustomer} onOpenChange={onOpenChangeSelectCustomer} />
    </section>
  )
}

export default QuoteCustomerData
