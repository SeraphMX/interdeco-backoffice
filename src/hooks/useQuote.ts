import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { quoteService } from '../services/quoteService'
import { RootState } from '../store'
import { setItems, setItemsLoaded, setSelectedCustomer } from '../store/slices/quoteSlice'
import { QuoteItem } from '../types'

export const useQuote = () => {
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)
  const customers = useSelector((state: RootState) => state.clientes.items)
  const products = useSelector((state: RootState) => state.productos.items)

  useEffect(() => {
    const fetchData = async () => {
      if (quote.data.id && !quote.itemsLoaded) {
        const customer = customers.find((c) => c.id == quote.data.customer_id)
        if (customer) dispatch(setSelectedCustomer(customer))

        const items = await loadQuoteItems(quote.data.id)
        if (isMounted && items.length) {
          dispatch(setItems(items as QuoteItem[]))
          dispatch(setItemsLoaded(true))
        }
      }
    }

    let isMounted = true
    const loadQuoteItems = async (quoteId: number) => {
      const response = await quoteService.getQuoteItems(quoteId)

      if (response.success && response.items) {
        return response.items.map((item) => ({
          product: products.find((p) => p.id === item.product_id) || null,
          requiredQuantity: item.required_quantity || 0,
          totalQuantity: item.total_quantity || 0,
          packagesRequired: item.packages_required || 0,
          subtotal: item.subtotal || 0,
          originalSubtotal: item.original_subtotal || 0,
          discount: item.discount || 0,
          discountType: item.discount_type || 'percentage',
          id: item.id
        }))
      }
      return []
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [quote.data.id, dispatch, customers, products, quote.data.customer_id, quote.itemsLoaded])
}
