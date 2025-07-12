import { ArcElement, Chart, Chart as ChartJS, Legend, Title, Tooltip, TooltipItem } from 'chart.js'
import { useEffect } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { Quote, quoteStatus } from '../../../types'
import { capitalizeFirst } from '../../../utils/strings'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

interface QuoteStatusChartProps {
  onTitleChange: (title: string, subtitle: string) => void
}

const QuoteStatusChart = ({ onTitleChange }: QuoteStatusChartProps) => {
  const quotes = useSelector((state: RootState) => state.quotes.items)

  // Contar cotizaciones por status
  const statusCounts = quoteStatus
    .map((status) => {
      const count = quotes.filter((quote: Quote) => quote.status === status.key).length
      return {
        status: status.label,
        count,
        color: getStatusColor(status.color),
        key: status.key
      }
    })
    .filter((item) => item.count > 0) // Solo mostrar status que tienen cotizaciones

  function getStatusColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      primary: '#3B82F6',
      secondary: '#7828c8',
      success: '#10B981',
      danger: '#EF4444',
      default: '#9CA3AF',
      warning: '#F59E0B'
    }
    return colorMap[color] || '#9CA3AF'
  }

  const chartData = {
    labels: statusCounts.map((item) => item.status),
    datasets: [
      {
        data: statusCounts.map((item) => item.count),
        backgroundColor: statusCounts.map((item) => item.color),
        borderColor: statusCounts.map((item) => item.color),
        borderWidth: 2,
        hoverBorderWidth: 3
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          generateLabels: function (chart: Chart<'doughnut'>) {
            const data = chart.data
            if (data.labels && data.labels.length && data.datasets.length) {
              const dataset = data.datasets[0]
              return data.labels.map((label, i) => {
                const value = dataset.data[i] as number
                return {
                  text: `${capitalizeFirst(label as string)}: ${value}`,
                  fillStyle: (dataset.backgroundColor as string[])[i],
                  hidden: false,
                  index: i
                }
              })
            }
            return []
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'doughnut'>) {
            const total = statusCounts.reduce((sum, item) => sum + item.count, 0)
            const percentage = total > 0 ? (((context.parsed as number) / total) * 100).toFixed(1) : '0'
            return `${context.label}: ${context.parsed} (${percentage}%)`
          }
        }
      }
    }
  }

  useEffect(() => {
    onTitleChange('Estado de Cotizaciones', 'Distribución por status')
  }, [onTitleChange])

  const totalQuotes = statusCounts.reduce((sum, item) => sum + item.count, 0)
  const mostCommonStatus = statusCounts.reduce((prev, current) => (prev.count > current.count ? prev : current), statusCounts[0])

  return (
    <>
      <div className='h-[350px] mb-4'>
        <Doughnut data={chartData} options={chartOptions} />
      </div>

      <div className='pt-4 border-t border-gray-200'>
        <div className='text-sm text-gray-600'>
          <p>
            <strong>Total de cotizaciones:</strong> {totalQuotes}
          </p>
          {mostCommonStatus && (
            <p className='mt-1'>
              <strong>Estado más común:</strong> {mostCommonStatus.status} ({mostCommonStatus.count})
            </p>
          )}
          <p className='mt-1'>
            <strong>Estados activos:</strong> {statusCounts.length} de {quoteStatus.length}
          </p>
        </div>
      </div>
    </>
  )
}

export default QuoteStatusChart
