import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setError, setLoading, setProducts } from '../store/slices/productsSlice'

export const useProducts = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Carga inicial
    const fetchProducts = async () => {
      dispatch(setLoading(true))
      const { data, error } = await supabase.from('product_details_view').select('*')
      if (data) dispatch(setProducts(data))
      if (error) {
        console.error('Error al cargar clientes:', error.message)
        dispatch(setLoading(false))
        dispatch(setError('Error al cargar clientes'))
      }
    }

    fetchProducts()

    // Realtime
    const channel = supabase
      .channel('realtime:Products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        fetchProducts
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dispatch])
}
