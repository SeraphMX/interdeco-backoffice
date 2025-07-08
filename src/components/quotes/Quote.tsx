import { useRef } from 'react'
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
  useQuote()

  return (
    <>
      <QuoteHeader />

      <section className=' overflow-y-auto relative rounded-xl  shadow-medium bg-white' ref={scrollRef}>
        <QuoteItems scrollRef={scrollRef} />

        {!quote.isPublicAccess && <QuoteItemsFooter />}
      </section>

      <QuoteFooter />
    </>
  )
}

export default Quote
