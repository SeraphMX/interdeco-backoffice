// src/hooks/useMeasureUnits.ts
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { addMeasureUnit, removeMeasureUnit, setMeasureUnits, updateMeasureUnit } from '../store/slices/catalogSlice'
import { MeasureUnit } from '../types'

export const useMeasureUnits = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Carga inicial
    const fetchMeasureUnits = async () => {
      const { data, error } = await supabase.from('measure_units').select('*')
      if (data) dispatch(setMeasureUnits(data))
      if (error) console.error('Error al cargar unidades de medida:', error.message)
    }

    fetchMeasureUnits()

    // Realtime
    const channel = supabase
      .channel('realtime:MeasureUnits')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'measure_units' }, (payload) => {
        const { eventType, new: newData, old: oldData } = payload
        if (eventType === 'INSERT') dispatch(addMeasureUnit(newData as MeasureUnit))
        if (eventType === 'UPDATE') dispatch(updateMeasureUnit(newData as MeasureUnit))
        if (eventType === 'DELETE') dispatch(removeMeasureUnit(oldData.key))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dispatch])
}
