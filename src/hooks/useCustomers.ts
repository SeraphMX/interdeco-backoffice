// src/hooks/useCustomers.ts
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { addCustomer, removeCustomer, setCustomers, updateCustomer } from '../store/slices/customersSlice'
import { Customer } from '../types'

export const useCustomers = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Carga inicial
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from('customers').select('*')
      if (data) dispatch(setCustomers(data))
      if (error) console.error('Error al cargar clientes:', error.message)
    }

    fetchCustomers()

    // Realtime
    const channel = supabase
      .channel('realtime:Customers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, (payload) => {
        const { eventType, new: newData, old: oldData } = payload
        if (eventType === 'INSERT') dispatch(addCustomer(newData as Customer))
        if (eventType === 'UPDATE') dispatch(updateCustomer(newData as Customer))
        if (eventType === 'DELETE') dispatch(removeCustomer(oldData.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dispatch])
}
