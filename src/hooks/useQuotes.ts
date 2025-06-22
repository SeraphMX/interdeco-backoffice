// src/hooks/useCustomers.ts
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'

import { setQuotes } from '../store/slices/quotesSlice'

export const useQuotes = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Carga inicial
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from('quotes_view').select('*')
      if (data) dispatch(setQuotes(data))
      if (error) console.error('Error al cargar clientes:', error.message)
    }

    fetchCustomers()

    // Realtime
    const channel = supabase
      .channel('realtime:Customers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes'
        },
        fetchCustomers
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dispatch])
}
