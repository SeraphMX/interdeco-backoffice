import { debounce } from 'lodash'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'

import { setLoading, setQuotes } from '../store/slices/quotesSlice'

export const useQuotes = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchQuotes = async () => {
      console.log('[useQuotes] Ejecutando fetchQuotes()...')
      const { data, error } = await supabase.from('quotes_view').select('*')
      if (error) {
        console.error('[useQuotes] Error al cargar cotizaciones:', error.message)
        return
      }
      dispatch(setQuotes(data))
      dispatch(setLoading(false))
    }

    dispatch(setLoading(true))
    const debouncedFetch = debounce(fetchQuotes, 500)
    fetchQuotes()

    const channel = supabase
      .channel('realtime:quotes-combined')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => {
        //console.log('[Realtime] Evento recibido en quotes:', payload)
        debouncedFetch()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quote_items' }, () => {
        //console.log('[Realtime] Evento recibido en quote_items:', payload)
        debouncedFetch()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      debouncedFetch.cancel() // cancela debounce en desmontaje
    }
  }, [dispatch])
}
