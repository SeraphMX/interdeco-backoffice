import { Button } from '@heroui/react'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useState } from 'react'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface MostUsedChartProps {
  onTitleChange: (title: string, subtitle: string) => void
  data: any
}

const MostUsedChart = ({ data, onTitleChange }: MostUsedChartProps) => {
  const [selectedDataType, setSelectedDataType] = useState<'material' | 'proveedor' | 'categoria'>('material')

  const getSourceData = () => {
    if (!data || !Array.isArray(data)) return []
    switch (selectedDataType) {
      case 'material':
        return data.find((d: any) => d.type === 'products')?.data ?? []
      case 'categoria':
        return data.find((d: any) => d.type === 'categories')?.data ?? []
      case 'proveedor':
        return data.find((d: any) => d.type === 'providers')?.data ?? []
      default:
        return []
    }
  }

  const getMasUtilizadosData = () => {
    const rawData = getSourceData()

    const unit = 'MXN'
    const total = rawData.reduce((acc: number, item: any) => acc + item.total, 0)
    const count = rawData.length

    const labels = rawData.map((item: any) => item.name)
    const dataPoints = rawData.map((item: any) => item.total)

    const baseColors = [
      'rgba(99, 102, 241, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(249, 115, 22, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(14, 165, 233, 0.8)',
      'rgba(250, 204, 21, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(132, 204, 22, 0.8)',
      'rgba(107, 114, 128, 0.8)'
    ]

    const colors = labels.map((_, i) => baseColors[i % baseColors.length])

    return {
      rawData,
      labels,
      data: dataPoints,
      colors,
      unit,
      total,
      count
    }
  }

  const topProductsData = getMasUtilizadosData()

  const masUtilizadosChartData = {
    labels: topProductsData.labels,
    datasets: [
      {
        label: `${selectedDataType === 'material' ? 'Materiales' : selectedDataType === 'proveedor' ? 'Proveedores' : 'Categorías'} más utilizados`,
        data: topProductsData.data,
        backgroundColor: topProductsData.colors,
        borderColor: topProductsData.colors.map((color) => color.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  }

  const topProductsChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const item = topProductsData.rawData[context.dataIndex]
            const quotes = item.quotes
            const total = item.total.toLocaleString('es-MX', {
              style: 'currency',
              currency: 'MXN'
            })
            return `${quotes} cotizaciones - ${total}`
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function (value: any) {
            return '$' + Number(value).toLocaleString('es-MX')
          }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      }
    }
  }

  const handleDataTypeChange = (type: 'material' | 'proveedor' | 'categoria') => {
    setSelectedDataType(type)
    const title = `${type === 'material' ? 'Materiales' : type === 'proveedor' ? 'Proveedores' : 'Categorías'} Más Utilizados`
    onTitleChange(title, 'Últimos 30 días')
  }

  return (
    <>
      <div className='flex gap-2 flex-wrap '>
        <Button
          size='sm'
          variant={selectedDataType === 'material' ? 'solid' : 'bordered'}
          color='primary'
          onPress={() => handleDataTypeChange('material')}
        >
          Material
        </Button>
        <Button
          size='sm'
          variant={selectedDataType === 'proveedor' ? 'solid' : 'bordered'}
          color='primary'
          onPress={() => handleDataTypeChange('proveedor')}
        >
          Proveedor
        </Button>
        <Button
          size='sm'
          variant={selectedDataType === 'categoria' ? 'solid' : 'bordered'}
          color='primary'
          onPress={() => handleDataTypeChange('categoria')}
        >
          Categoría
        </Button>
      </div>

      <div className='flex-grow min-h-0 mb-4'>
        <Bar data={masUtilizadosChartData} options={topProductsChartOptions} />
      </div>
    </>
  )
}

export default MostUsedChart
