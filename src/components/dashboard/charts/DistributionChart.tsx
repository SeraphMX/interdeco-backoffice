import { Button } from '@heroui/react'
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js'
import { useEffect, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

interface DistributionChartProps {
  onTitleChange: (title: string, subtitle: string) => void
}

const DistributionChart = ({ onTitleChange }: DistributionChartProps) => {
  const [selectedDistribution, setSelectedDistribution] = useState<'categorias' | 'proveedores'>('categorias')
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'cotizados'>('cotizados')

  const categorias = useSelector((state: RootState) => state.catalog.categories)
  const proveedores = useSelector((state: RootState) => state.catalog.providers)

  // Generar datos de distribución usando datos reales del estado
  const getDistributionData = () => {
    // Simular diferentes datasets según el filtro
    const isAllProducts = selectedFilter === 'todos'
    const multiplier = isAllProducts ? 1.5 : 1 // Simular que hay más productos en total
    const baseValue = isAllProducts ? 15 : 10

    if (selectedDistribution === 'categorias') {
      // Usar categorías reales del estado con cantidades dummy
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280', '#EC4899', '#14B8A6']
      return categorias.map((categoria, index) => ({
        categoria: categoria.description,
        valor: Math.floor(Math.random() * (30 * multiplier)) + baseValue, // Valores ajustados según filtro
        color: colors[index % colors.length]
      }))
    } else {
      // Usar proveedores reales del estado con cantidades dummy
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280', '#EC4899', '#14B8A6']
      return proveedores.map((proveedor, index) => ({
        proveedor: proveedor.name,
        valor: Math.floor(Math.random() * (25 * multiplier)) + Math.floor(baseValue * 0.8), // Valores ajustados según filtro
        color: colors[index % colors.length]
      }))
    }
  }

  const distributionData = getDistributionData()

  // Configuración del Doughnut Chart para distribución
  const distributionChartData = {
    labels: distributionData.map((d) => (selectedDistribution === 'categorias' ? d.categoria : d.proveedor)),
    datasets: [
      {
        data: distributionData.map((d) => d.valor),
        backgroundColor: distributionData.map((d) => d.color),
        borderColor: distributionData.map((d) => d.color),
        borderWidth: 2,
        hoverBorderWidth: 3
      }
    ]
  }

  const distributionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          generateLabels: function (chart: any) {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0]
                const value = dataset.data[i]
                return {
                  text: `${label}: ${value}%`,
                  fillStyle: dataset.backgroundColor[i],
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
          label: function (context: any) {
            return `${context.label}: ${context.parsed}%`
          }
        }
      }
    }
  }

  const handleDistributionChange = (type: 'categorias' | 'proveedores') => {
    setSelectedDistribution(type)
    updateTitle(type, selectedFilter)
  }

  const handleFilterChange = (filter: 'todos' | 'cotizados') => {
    setSelectedFilter(filter)
    updateTitle(selectedDistribution, filter)
  }

  const updateTitle = (type: 'categorias' | 'proveedores', filter: 'todos' | 'cotizados') => {
    const baseTitle = type === 'categorias' ? 'Distribución por Categorías' : 'Distribución por Proveedores'
    const filterText = filter === 'todos' ? 'todos los productos' : 'productos cotizados'
    const subtitle = type === 'categorias' ? `Proporción de ${filterText}` : `Participación en ${filterText}`
    const title = `${baseTitle}`
    onTitleChange(title, subtitle)
  }

  useEffect(() => {
    updateTitle(selectedDistribution, selectedFilter)
  }, [selectedDistribution, selectedFilter, onTitleChange])

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

      {/* Botones para cambiar entre categorías y proveedores */}
      <div className='flex gap-2 mb-4 flex-wrap'>
        <Button
          size='sm'
          variant={selectedDistribution === 'categorias' ? 'solid' : 'bordered'}
          color='primary'
          onPress={() => handleDistributionChange('categorias')}
        >
          Categorías
        </Button>
        <Button
          size='sm'
          variant={selectedDistribution === 'proveedores' ? 'solid' : 'bordered'}
          color='primary'
          onPress={() => handleDistributionChange('proveedores')}
        >
          Proveedores
        </Button>
      </div>

      <div className='h-[350px] mb-4'>
        <Doughnut data={distributionChartData} options={distributionChartOptions} />
      </div>

      <div className='pt-4 border-t border-gray-200'>
        <div className='text-sm text-gray-600'>
          {selectedDistribution === 'categorias' ? (
            <>
              <p>
                <strong>Categoría principal:</strong> {distributionData[0]?.categoria} ({distributionData[0]?.valor}%)
              </p>
              <p className='mt-1'>
                <strong>Total de categorías:</strong> {distributionData.length}
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Proveedor principal:</strong> {distributionData[0]?.proveedor} ({distributionData[0]?.valor}%)
              </p>
              <p className='mt-1'>
                <strong>Total de proveedores:</strong> {distributionData.length}
              </p>
            </>
          )}
          <p className='mt-1'>
            <strong>Filtro aplicado:</strong> {selectedFilter === 'todos' ? 'Todos los productos' : 'Solo productos cotizados'}
          </p>
        </div>
      </div>
    </>
  )
}

export default DistributionChart
