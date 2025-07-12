import { Button } from '@heroui/react'
import { BarElement, CategoryScale, Chart as ChartJS, CoreScaleOptions, Legend, LinearScale, Scale, Title, Tooltip } from 'chart.js'
import { format, isSameDay, isSameMonth, isSameWeek, parseISO, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { setSelectedPeriod } from '../../../store/slices/dashboardSlice'
import { Period } from '../../../types'
import { formatCurrency } from '../../../utils/currency'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const QuoteAmountChart = () => {
  const dispatch = useDispatch()
  const cotizaciones = useSelector((state: RootState) => state.quotes.items)
  const selectedPeriod = useSelector((state: RootState) => state.dashboard.selectedPeriod)
  const [legendPeriod, setLegendPeriod] = useState('')

  // Agrupa y suma montos reales por período
  const getPeriodData = () => {
    const now = new Date()
    const data: { label: string; amount: number }[] = []

    switch (selectedPeriod) {
      case 'day': {
        // Últimos 7 días
        for (let i = 6; i >= 0; i--) {
          const targetDate = subDays(now, i)
          const dayLabel = format(targetDate, 'EEE d', { locale: es }) // ej. "lun 8"

          const total = cotizaciones.reduce((sum, quote) => {
            const date = quote.created_at ? parseISO(quote.created_at) : null
            return date && isSameDay(date, targetDate) ? sum + quote.total : sum
          }, 0)

          data.push({ label: dayLabel, amount: Math.round(total) })
        }
        break
      }

      case 'week': {
        const weekLabels = ['Esta semana', 'Semana pasada', 'Hace 2 semanas', 'Hace 3 semanas']

        for (let i = 0; i < 4; i++) {
          const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
          const label = weekLabels[i] || `Hace ${i} semanas` // Fallback si amplías el rango

          const total = cotizaciones.reduce((sum, quote) => {
            const date = quote.created_at ? parseISO(quote.created_at) : null
            return date && isSameWeek(date, weekStart, { weekStartsOn: 1 }) ? sum + quote.total : sum
          }, 0)

          // NOTA: Usamos `unshift` porque el for va de 0 a 3, y quieres que queden en orden cronológico
          data.unshift({ label, amount: Math.round(total) })
        }
        break
      }

      case 'month': {
        // Últimos 6 meses
        for (let i = 5; i >= 0; i--) {
          const targetMonth = subMonths(now, i)
          const label = format(targetMonth, 'MMM yy', { locale: es }) // ej. "jul. 24"

          const total = cotizaciones.reduce((sum, quote) => {
            const date = quote.created_at ? parseISO(quote.created_at) : null
            return date && isSameMonth(date, targetMonth) ? sum + quote.total : sum
          }, 0)

          data.push({ label, amount: Math.round(total) })
        }
        break
      }
    }

    return data
  }

  const periodData = getPeriodData()

  const chartData = {
    labels: periodData.map((item) => item.label),
    datasets: [
      {
        label: 'Monto Cotizado',
        data: periodData.map((item) => item.amount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback(this: Scale<CoreScaleOptions>, tickValue: string | number) {
            const val = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue)
            return formatCurrency(val, 'short')
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  const handlePeriodChange = (period: Period) => {
    dispatch(setSelectedPeriod(period))
    updateLegend(period)
  }

  const updateLegend = (period: Period) => {
    const periodLabels = {
      day: 'Últimos 7 días',
      week: 'Últimas 4 semanas',
      month: 'Últimos 6 meses'
    }
    setLegendPeriod(periodLabels[period])
  }

  useEffect(() => {
    updateLegend(selectedPeriod)
  }, [selectedPeriod])

  const totalAmount = periodData.reduce((sum, item) => sum + item.amount, 0)
  const averageAmount = totalAmount / periodData.length
  const highestPeriod = periodData.reduce((prev, current) => (prev.amount > current.amount ? prev : current), periodData[0])

  return (
    <>
      {/* Botones para cambiar período */}
      <header className='flex items-center justify-between '>
        <div className='flex gap-2 mb-4 flex-wrap'>
          <Button
            size='sm'
            variant={selectedPeriod === 'day' ? 'solid' : 'bordered'}
            color='primary'
            onPress={() => handlePeriodChange('day')}
          >
            Días
          </Button>
          <Button
            size='sm'
            variant={selectedPeriod === 'week' ? 'solid' : 'bordered'}
            color='primary'
            onPress={() => handlePeriodChange('week')}
          >
            Semanas
          </Button>
          <Button
            size='sm'
            variant={selectedPeriod === 'month' ? 'solid' : 'bordered'}
            color='primary'
            onPress={() => handlePeriodChange('month')}
          >
            Meses
          </Button>
        </div>
        <div>
          <p className='text-sm text-gray-500 mt-1'>{legendPeriod}</p>
        </div>
      </header>

      <div className='h-[300px] mb-4'>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className='pt-4 border-t border-gray-200'>
        <div className='text-sm text-gray-600'>
          <p>
            <strong>Total:</strong> {formatCurrency(totalAmount)}
          </p>
          <p className='mt-1'>
            <strong>Promedio:</strong> {formatCurrency(averageAmount)}
          </p>
          {highestPeriod && (
            <p className='mt-1'>
              <strong>Período más alto:</strong> {highestPeriod.label} ({formatCurrency(highestPeriod.amount)})
            </p>
          )}
        </div>
      </div>
    </>
  )
}

export default QuoteAmountChart
