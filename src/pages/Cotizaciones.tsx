import { Button, Spinner } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { FileInput, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import QuotesFilters from '../components/quotes/QuotesFilters'
import QuotesTable from '../components/quotes/QuotesTable'
import { RootState } from '../store'
import { clearQuote, setItemsLoaded } from '../store/slices/quoteSlice'

const Cotizaciones = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)
  const tableWrapperRef = useRef<HTMLDivElement>(null)

  const [filterValue, setFilterValue] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [tableWrapperHeight, setwrapperHeight] = useState(60)

  const handleNewQuote = () => {
    dispatch(clearQuote())
    dispatch(setItemsLoaded(true))
    navigate('/cotizaciones/nueva')
  }

  useEffect(() => {
    const currentWrapper = tableWrapperRef.current

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setwrapperHeight(entry.contentRect.height)
        console.log('Altura del div actualizada:', entry.contentRect.height)
      }
    })

    // Observar cambios en el div
    if (tableWrapperRef.current) {
      observer.observe(tableWrapperRef.current)
    }

    return () => {
      // Limpieza

      if (currentWrapper) {
        observer.unobserve(currentWrapper)
      }
    }
  }, [])

  useEffect(() => {
    if (quote.pendingClear) {
      const timeout = setTimeout(() => {
        dispatch(clearQuote())
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [quote.pendingClear, dispatch])

  return (
    <div className='gap-6 h-full flex flex-col'>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <Spinner size='lg' className='absolute' />
      </div>
      <header className='flex justify-between items-start sm:items-center gap-4'>
        <QuotesFilters
          filters={{
            search: {
              value: filterValue,
              setValue: setFilterValue
            },
            status: {
              value: selectedStatus,
              setValue: setSelectedStatus
            }
          }}
        />
        <section className='flex items-center gap-2'>
          <AnimatePresence>
            {(quote.data.items ?? []).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ duration: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Button onPress={() => navigate('/cotizaciones/nueva')} color='secondary' variant='ghost' isIconOnly={isMobile}>
                  <FileInput size={20} />
                  {!isMobile && 'Continuar'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button onPress={handleNewQuote} color='primary' variant='ghost'>
            <Plus size={20} />
            Nueva
          </Button>
        </section>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut', delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
        className='flex-grow overflow-hidden shadow-small rounded-lg relative '
        ref={tableWrapperRef}
      >
        <QuotesTable wrapperHeight={tableWrapperHeight} filterValue={filterValue} selectedStatus={selectedStatus}></QuotesTable>
      </motion.div>
    </div>
  )
}

export default Cotizaciones
