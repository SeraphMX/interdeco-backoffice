// hooks/useTopProducts.ts
import { endOfDay, startOfDay, subDays, subMonths, subYears } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

interface TopProduct {
  id: number
  name: string
  category: string
  quotes: number
  total: number
}

type Period = 'week' | 'month' | 'year' | 'all'

export const useProductsMetrics = () => {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('all')

  const { from_date, to_date } = useMemo(() => {
    const to = endOfDay(new Date())
    const now = new Date()
    let from: Date | null = null

    switch (period) {
      case 'week':
        from = startOfDay(subDays(now, 7))
        break
      case 'month':
        from = startOfDay(subMonths(now, 1))
        break
      case 'year':
        from = startOfDay(subYears(now, 1))
        break
      case 'all':
        from = null
        break
    }

    return { from_date: from?.toISOString() ?? null, to_date: period === 'all' ? null : to.toISOString() }
  }, [period])

  useEffect(() => {
    const fetchTopProducts = async () => {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_product_metrics', {
        from_date,
        to_date
      })

      if (error) {
        console.error('Error al metricas:', error.message)
        setError('Error al cargar productos más cotizados')
        setLoading(false)
        return
      }

      setMetrics(data)

      setLoading(false)
    }
    fetchTopProducts()

    const channel = supabase
      .channel('realtime:quote_items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_items'
        },
        fetchTopProducts
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [from_date, to_date]) // importante: actualizar al cambiar fechas

  return { products: metrics, loading, error, period, setPeriod }
}
