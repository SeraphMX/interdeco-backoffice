import { Button } from '@heroui/react'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface CategoryProviderChartProps {
  onTitleChange: (title: string, subtitle: string) => void
}

//TODO: Arreglar tipado
const CategoryProviderChart = ({ onTitleChange }: CategoryProviderChartProps) => {
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'cotizados'>('cotizados')

  const categoryProvider = useSelector((state: RootState) => state.dashboard.stacked_by_category_provider)

  console.log('CategoryProvider data:', categoryProvider)

  const transformData = () => {
    const type = selectedFilter === 'todos' ? 'all_products' : 'quote_items'

    const found = categoryProvider.find((item) => item.type === type)
    if (!found) return []

    return found.data.map((entry: any) => {
      const proveedores: Record<string, number> = {}
      for (const serie of entry.series) {
        proveedores[serie.provider] = serie.total
      }

      return {
        categoria: entry.category,
        proveedores
      }
    })
  }

  const categoriasPorProveedorData = transformData()

  // Configuración del Stacked Bar Chart
  const stackedChartData = {
    labels: categoriasPorProveedorData.map((c) => c.categoria),
    datasets: Object.keys(
      categoriasPorProveedorData.reduce(
        (acc, curr) => {
          Object.keys(curr.proveedores).forEach((prov) => {
            acc[prov] = true
          })
          return acc
        },
        {} as Record<string, boolean>
      )
    ).map((proveedor, index) => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280']
      return {
        label: proveedor,
        data: categoriasPorProveedorData.map((c) => c.proveedores[proveedor] || 0),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 1,
        borderRadius: 2
      }
    })
  }

  const stackedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }

  const handleFilterChange = (filter: 'todos' | 'cotizados') => {
    setSelectedFilter(filter)
    updateTitle(filter)
  }

  const updateTitle = (filter: 'todos' | 'cotizados') => {
    const filterText = filter === 'todos' ? 'todos los productos' : 'productos cotizados'
    onTitleChange('Productos por Categoría y Proveedor', `${filterText.charAt(0).toUpperCase() + filterText.slice(1)} por categoría`)
  }

  useEffect(() => {
    updateTitle(selectedFilter)
  }, [selectedFilter, onTitleChange])

  return (
    <>
      {/* Botones para filtrar entre todos los productos y cotizados */}
      <div className='flex gap-2 mb-4 flex-wrap'>
        <Button
          size='sm'
          variant={selectedFilter === 'todos' ? 'solid' : 'bordered'}
          color='secondary'
          onPress={() => handleFilterChange('todos')}
        >
          Todos los productos
        </Button>
        <Button
          size='sm'
          variant={selectedFilter === 'cotizados' ? 'solid' : 'bordered'}
          color='secondary'
          onPress={() => handleFilterChange('cotizados')}
        >
          Productos cotizados
        </Button>
      </div>

      <div className='h-[350px] mb-4'>
        <Bar data={stackedChartData} options={stackedChartOptions} />
      </div>
      <div className='pt-4 border-t border-gray-200'>
        <div className='text-sm text-gray-600'>
          <p>
            <strong>Total de productos:</strong>{' '}
            {categoriasPorProveedorData.reduce((acc, cat) => acc + Object.values(cat.proveedores).reduce((sum, val) => sum + val, 0), 0)}{' '}
            productos
          </p>
          <p className='mt-1'>
            <strong>Categorías activas:</strong> {categoriasPorProveedorData.length}
          </p>
        </div>
      </div>
    </>
  )
}

export default CategoryProviderChart
