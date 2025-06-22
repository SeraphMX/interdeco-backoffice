import { Card, CardBody, CardHeader, Chip } from '@heroui/react'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { FileText, Package, TrendingUp, Users } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { quoteStatus, uiColors } from '../types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Dashboard = () => {
  const clientes = useSelector((state: RootState) => state.clientes.items)
  const cotizaciones = useSelector((state: RootState) => state.quotes.items)
  const productos = useSelector((state: RootState) => state.productos.items)

  // // Ordenar materiales por uso y tomar los top 5
  // const topMateriales = Object.entries(materialesUsados)
  //   .sort(([, a], [, b]) => b - a)
  //   .slice(0, 5)
  //   .map(([materialId, metros]) => ({
  //     material: productos.find((p) => p.id === materialId)?.nombre || 'Desconocido',
  //     metros
  //   }))

  // const chartData = {
  //   labels: topMateriales.map((m) => m.material),
  //   datasets: [
  //     {
  //       label: 'Metros cuadrados utilizados',
  //       data: topMateriales.map((m) => m.metros),
  //       backgroundColor: 'rgba(99, 102, 241, 0.5)',
  //       borderColor: 'rgb(99, 102, 241)',
  //       borderWidth: 1
  //     }
  //   ]
  // }

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Materiales Más Utilizados (m²)'
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  }

  const stats = [
    { title: 'Clientes', value: clientes.length, icon: Users, color: 'bg-blue-500' },
    { title: 'Productos', value: productos.length, icon: Package, color: 'bg-green-500' },
    { title: 'Cotizaciones', value: cotizaciones.length, icon: FileText, color: 'bg-purple-500' },
    {
      title: 'Total Ventas',
      value: cotizaciones
        .reduce((acc, curr) => acc + curr.total, 0)
        .toLocaleString('es-MX', {
          style: 'currency',
          currency: 'MXN'
        }),
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  //Obtener las últimas 5 cotizaciones ordenadas por fecha
  const ultimasCotizaciones = [...cotizaciones]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5)

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat) => (
          <div key={stat.title} className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>{stat.title}</p>
                <p className='text-lg font-semibold text-gray-900'>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='p-6'>
          <CardHeader>
            <h2 className='text-lg font-semibold text-gray-900'>Últimas Cotizaciones</h2>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
              {ultimasCotizaciones.map((quote) => {
                const cliente = clientes.find((c) => c.id === quote.customer_id)
                return (
                  <div key={quote.id} className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                    <div>
                      <p className='font-medium text-gray-900'>{cliente?.name}</p>
                      <p className='text-sm text-gray-500'>
                        {quote.created_at ? new Date(quote.created_at).toLocaleDateString('es-MX') : 'Fecha no disponible'}
                      </p>
                      <Chip
                        className='capitalize'
                        variant='bordered'
                        color={quoteStatus.find((s) => s.key === quote.status)?.color as uiColors}
                      >
                        {quoteStatus.find((s) => s.key === quote.status)?.label}
                      </Chip>
                    </div>
                    <div className='flex items-center gap-4'>
                      <span className='font-semibold'>
                        {quote.total.toLocaleString('es-MX', {
                          style: 'currency',
                          currency: 'MXN'
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>

        <Card className='p-6'>
          <CardHeader>
            <h2 className='text-lg font-semibold text-gray-900'>Materiales Más Usados</h2>
          </CardHeader>
          <CardBody>
            <div className='h-[300px]'>{/* <Bar data={chartData} options={chartOptions} /> */}</div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
