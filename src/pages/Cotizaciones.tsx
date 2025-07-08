import { Button } from '@heroui/react'
import { FileInput, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  const [tableWrapperHeight, setwrapperHeight] = useState(0)

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

  return (
    <div className='space-y-6 h-full flex flex-col'>
      <header className='flex justify-between items-center gap-4'>
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
          {(quote.data.items ?? []).length > 0 && (
            <Button onPress={() => navigate('/cotizaciones/nueva')} color='secondary' variant='ghost'>
              <FileInput size={20} />
              Continuar
            </Button>
          )}

          <Button onPress={handleNewQuote} color='primary' variant='ghost'>
            <Plus size={20} />
            Nueva
          </Button>
        </section>
      </header>

      <section className='flex-grow overflow-hidden shadow-medium rounded-lg ' ref={tableWrapperRef}>
        <QuotesTable wrapperHeight={tableWrapperHeight} filterValue={filterValue} selectedStatus={selectedStatus}></QuotesTable>
      </section>
    </div>
  )
}

export default Cotizaciones
