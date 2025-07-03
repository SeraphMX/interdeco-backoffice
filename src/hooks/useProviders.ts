// src/hooks/useCategories.ts
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { addProvider, removeProvider, setProviders, updateProvider } from '../store/slices/catalogSlice'
import { Provider } from '../types'

export const useProviders = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Carga inicial
    const fetchProviders = async () => {
      const { data, error } = await supabase.from('providers').select('*')
      if (data) dispatch(setProviders(data))
      if (error) console.error('Error al cargar los proveedores:', error.message)
    }

    fetchProviders()

    // Realtime
    const channel = supabase
      .channel('realtime:Providers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'providers' }, (payload) => {
        const { eventType, new: newData, old: oldData } = payload
        if (eventType === 'INSERT') dispatch(addProvider(newData as Provider))
        if (eventType === 'UPDATE') dispatch(updateProvider(newData as Provider))
        if (eventType === 'DELETE') dispatch(removeProvider(oldData.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dispatch])
}
