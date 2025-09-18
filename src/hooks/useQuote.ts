import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { quoteService } from '../services/quoteService'
import { RootState } from '../store'
import { setItems, setItemsLoaded, setSelectedCustomer } from '../store/slices/quoteSlice'

export const useQuote = () => {
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)
  const customers = useSelector((state: RootState) => state.clientes.items)
  const products = useSelector((state: RootState) => state.productos.items)

  const quoteId = quote.data?.id
  const customerId = quote.data?.customer_id

  const productsReady = products.length > 0
  const customersReady = customers.length > 0

  useEffect(() => {
    if (!quoteId || quote.itemsLoaded || !productsReady || !customersReady) return

    let isMounted = true

    const fetchData = async () => {
      const customer = customers.find((c) => c.id === customerId)
      if (customer) dispatch(setSelectedCustomer(customer))

      const response = await quoteService.getQuoteItems(quoteId)
      if (response.success && response.items && isMounted) {
        const items = response.items.map((item) => ({
          uid: uuidv4(), // Aseguramos que cada item tenga un uid único
          product: products.find((p) => p.id === item.product_id) || undefined,
          requiredQuantity: item.required_quantity || 0,
          totalQuantity: item.total_quantity || 0,
          packagesRequired: item.packages_required || 0,
          subtotal: item.subtotal || 0,
          originalSubtotal: item.original_subtotal || 0,
          discount: item.discount || 0,
          discountType: item.discount_type || 'percentage',
          description: item.description || '',
          id: item.id,
          observations: item.observations || null
        }))

        dispatch(setItems(items))
        dispatch(setItemsLoaded(true))
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [quoteId, customerId, quote.itemsLoaded, productsReady, customersReady, dispatch, customers, products])
}
