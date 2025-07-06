import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useQuote } from '../../hooks/useQuote'
import { RootState } from '../../store'
import QuoteFooter from './quote/QuoteFooter'
import QuoteHeader from './quote/QuoteHeader'
import QuoteItems from './quote/QuoteItems'
import QuoteItemsFooter from './quote/QuoteItemsFooter'

const Quote = () => {
  const quote = useSelector((state: RootState) => state.quote)

  const scrollRef = useRef<HTMLDivElement>(null)
  const prevItemsLengthRef = useRef((quote.data.items ?? []).length)

  useQuote()

  useEffect(() => {
    if (quote.data.items && quote.data.items.length > prevItemsLengthRef.current) {
      // Se agregó un nuevo producto
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }

    prevItemsLengthRef.current = quote.data.items?.length || 0
  }, [quote.data.items, scrollRef])
  return (
    <>
      <QuoteHeader />

      <section className=' overflow-y-auto relative rounded-xl  shadow-medium bg-white' ref={scrollRef}>
        <QuoteItems />

        {!quote.isPublicAccess && <QuoteItemsFooter />}
      </section>

      <QuoteFooter />
    </>
  )
}

export default Quote
