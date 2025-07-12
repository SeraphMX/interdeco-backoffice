import { Button } from '@heroui/react'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface CategoryProviderChartProps {
  onTitleChange: (title: string, subtitle: string) => void
}

const CategoryProviderChart = ({ onTitleChange }: CategoryProviderChartProps) => {
  console.log('chartProviderMopntado')
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'cotizados'>('cotizados')

  // Datos dummy para productos por categoría (Stacked Bar Chart)
  const getCategoriasPorProveedorData = () => {
    // Simular diferentes datasets según el filtro
    const isAllProducts = selectedFilter === 'todos'
    const multiplier = isAllProducts ? 1.8 : 1 // Simular más productos en total

    return [
      {
        categoria: 'Pisos',
        proveedores: {
          Interceramic: Math.floor(45 * multiplier),
          Lamosa: Math.floor(38 * multiplier),
          Vitromex: Math.floor(25 * multiplier),
          Corona: Math.floor(22 * multiplier)
        }
      },
      {
        categoria: 'Azulejos',
        proveedores: {
          Interceramic: Math.floor(32 * multiplier),
          Lamosa: Math.floor(28 * multiplier),
          Vitromex: Math.floor(35 * multiplier),
          Corona: Math.floor(15 * multiplier)
        }
      },
      {
        categoria: 'Sanitarios',
        proveedores: {
          FV: Math.floor(40 * multiplier),
          Helvex: Math.floor(35 * multiplier),
          Interceramic: Math.floor(20 * multiplier),
          Corona: Math.floor(18 * multiplier)
        }
      },
      {
        categoria: 'Persianas',
        proveedores: {
          'Hunter Douglas': Math.floor(55 * multiplier),
          Luxaflex: Math.floor(30 * multiplier),
          'Sheer Elegance': Math.floor(25 * multiplier)
        }
      },
      {
        categoria: 'Cortinas',
        proveedores: {
          'Sheer Elegance': Math.floor(45 * multiplier),
          'Hunter Douglas': Math.floor(35 * multiplier),
          Luxaflex: Math.floor(20 * multiplier)
        }
      }
    ]
  }

  const categoriasPorProveedorDummy = getCategoriasPorProveedorData()

  // Configuración del Stacked Bar Chart
  const stackedChartData = {
    labels: categoriasPorProveedorDummy.map((c) => c.categoria),
    datasets: Object.keys(categoriasPorProveedorDummy[0].proveedores).map((proveedor, index) => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280']
      return {
        label: proveedor,
        data: categoriasPorProveedorDummy.map((c) => c.proveedores[proveedor as keyof typeof c.proveedores] || 0),
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
            {categoriasPorProveedorDummy.reduce((acc, cat) => acc + Object.values(cat.proveedores).reduce((sum, val) => sum + val, 0), 0)}{' '}
            productos
          </p>
          <p className='mt-1'>
            <strong>Categorías activas:</strong> {categoriasPorProveedorDummy.length}
          </p>
          <p className='mt-1'>
            <strong>Filtro aplicado:</strong> {selectedFilter === 'todos' ? 'Todos los productos' : 'Solo productos cotizados'}
          </p>
        </div>
      </div>
    </>
  )
}

export default CategoryProviderChart
