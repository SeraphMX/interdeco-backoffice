// src/hooks/useCategories.ts
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { addCategory, removeCategory, setCategories, updateCategory } from '../store/slices/catalogSlice'
import { Category } from '../types'

export const useCategories = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Carga inicial
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*')
      if (data) dispatch(setCategories(data))
      if (error) console.error('Error al cargar categorías:', error.message)
    }

    fetchCategories()

    // Realtime
    const channel = supabase
      .channel('realtime:Categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        const { eventType, new: newData, old: oldData } = payload
        if (eventType === 'INSERT') dispatch(addCategory(newData as Category))
        if (eventType === 'UPDATE') dispatch(updateCategory(newData as Category))
        if (eventType === 'DELETE') dispatch(removeCategory(oldData.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dispatch])
}
