import { Button, Card, CardBody, CardHeader, Tab, Tabs } from '@heroui/react'
import { FileText, Package, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import QuoteAmountChart from '../components/dashboard/charts/QuoteAmountChart'
import QuoteStatusChart from '../components/dashboard/charts/QuoteStatusChart'
import QuoteSummary from '../components/dashboard/QuoteSummary'
import { RootState } from '../store'
import { formatCurrency } from '../utils/currency'

const Dashboard = () => {
  const navigate = useNavigate()
  const clientes = useSelector((state: RootState) => state.clientes.items)
  const cotizaciones = useSelector((state: RootState) => state.quotes.items)
  const productos = useSelector((state: RootState) => state.productos.items)

  const [selectedChart, setSelectedChart] = useState('mas-utilizados')
  const [chartTitle, setChartTitle] = useState('Materiales Más Utilizados')
  const [chartSubtitle, setChartSubtitle] = useState('Últimos 30 días')
  const [selectedQuoteTab, setSelectedQuoteTab] = useState('ultimas')
  const [quoteTabSubtitle, setQuoteTabSubtitle] = useState('Las cotizaciones más recientes')

  const quotesTotal = cotizaciones.reduce((acc, curr) => acc + curr.total, 0)

  const stats = [
    { title: 'Cotizaciones', value: cotizaciones.length, icon: FileText, color: 'bg-purple-500' },
    { title: 'Clientes', value: clientes.length, icon: Users, color: 'bg-blue-500' },
    { title: 'Productos', value: productos.length, icon: Package, color: 'bg-green-500' },
    {
      title: 'Total cotizado',
      value: formatCurrency(quotesTotal, 'short', 'en', 'MXN'),
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  // Obtener las últimas 5 cotizaciones ordenadas por fecha
  const lastQuotes = [...cotizaciones.filter((q) => q.status !== 'archived' && q.status !== 'expired')]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 10)

  // Simulación de cotizaciones próximas a expirar
  const getExpiringQuotes = () => {
    // Tomar algunas cotizaciones y simular que están próximas a expirar
    return lastQuotes.slice(0, 10).map((quote) => ({
      ...quote,
      daysToExpire: Math.floor(Math.random() * 3) + 1 // 1-3 días
    }))
  }

  const handleQuoteTabTitleChange = (subtitle: string) => {
    setQuoteTabSubtitle(subtitle)
  }

  const expiringQuotes = getExpiringQuotes()
  return (
    <div className='space-y-6 flex flex-col h-full '>
      <h1 className='text-3xl font-bold text-gray-900 '>Dashboard</h1>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
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

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:flex-grow lg:min-h-0'>
        {/* Sección de Cotizaciones con Tabs */}
        <Card className='shadow-medium'>
          <CardHeader className='pb-1 flex flex-col'>
            <div className='flex items-center justify-between w-full'>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>Cotizaciones</h2>
                {quoteTabSubtitle && <p className='text-sm text-gray-500 mt-1'>{quoteTabSubtitle}</p>}
              </div>
              {selectedQuoteTab === 'ultimas' && (
                <Button size='sm' variant='ghost' color='primary' onPress={() => navigate('/cotizaciones')}>
                  Ver todas
                </Button>
              )}
            </div>
            <Tabs
              selectedKey={selectedQuoteTab}
              onSelectionChange={(key) => {
                setSelectedQuoteTab(key as string)
                if (key === 'ultimas') {
                  setQuoteTabSubtitle('Las cotizaciones más recientes')
                } else if (key === 'expirando') {
                  setQuoteTabSubtitle('Cotizaciones que vencen pronto')
                }
              }}
              color='primary'
              variant='underlined'
              fullWidth
              classNames={{
                tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-divider',
                cursor: 'w-full bg-primary',
                tab: 'max-w-fit px-0 h-12',
                tabContent: 'group-data-[selected=true]:text-primary'
              }}
            >
              <Tab key='ultimas' title='Últimas'></Tab>
              <Tab key='expirando' title='Próximas a Expirar'></Tab>
              <Tab key='status' title='Estado'></Tab>
              <Tab key='total' title='Total cotizado'></Tab>
            </Tabs>
          </CardHeader>
          <CardBody className='space-y-4  overflow-y-auto'>
            <div className=''>
              {selectedQuoteTab === 'ultimas' && (
                <div className='space-y-4'>
                  {lastQuotes.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <FileText className='mx-auto h-12 w-12 mb-3 opacity-50' />
                      <p>No hay cotizaciones disponibles</p>
                    </div>
                  ) : (
                    lastQuotes.map((quote) => {
                      return <QuoteSummary key={quote.id} quote={quote} />
                    })
                  )}
                </div>
              )}

              {selectedQuoteTab === 'expirando' && (
                <div className='space-y-4'>
                  {expiringQuotes.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <FileText className='mx-auto h-12 w-12 mb-3 opacity-50' />
                      <p>No hay cotizaciones próximas a expirar</p>
                    </div>
                  ) : (
                    expiringQuotes.map((quote) => {
                      return <QuoteSummary key={quote.id} quote={quote} show='expiring' />
                    })
                  )}
                </div>
              )}

              {selectedQuoteTab === 'status' && <QuoteStatusChart onTitleChange={handleQuoteTabTitleChange} />}
              {selectedQuoteTab === 'total' && <QuoteAmountChart onTitleChange={handleQuoteTabTitleChange} />}
            </div>
          </CardBody>
        </Card>

        {/* Gráficos con Tabs */}
        <Card className='shadow-medium'>
          <CardHeader className='pb-4'>
            <h2 className='text-xl font-bold text-gray-900'>{chartTitle}</h2>
            <p className='text-sm text-gray-500 mt-1'>{chartSubtitle}</p>
          </CardHeader>
          <CardBody>
            <Tabs
              selectedKey={selectedChart}
              onSelectionChange={(key) => setSelectedChart(key as string)}
              color='primary'
              variant='underlined'
              classNames={{
                tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-divider',
                cursor: 'w-full bg-primary',
                tab: 'max-w-fit px-0 h-12',
                tabContent: 'group-data-[selected=true]:text-primary'
              }}
            >
              <Tab key='mas-utilizados' title='Más Utilizados'></Tab>
              <Tab key='categorias-proveedores' title='Categorías por proveedor'></Tab>
              <Tab key='distribucion' title='Distribución'></Tab>
            </Tabs>

            <div className='mt-6'></div>
          </CardBody>
        </Card>
      </div>

      {/* Resumen adicional */}
      {/* <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='shadow-medium'>
          <CardBody className='text-center p-6'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>{cotizaciones.filter((q) => q.status === 'sent').length}</div>
            <p className='text-gray-600'>Cotizaciones Enviadas</p>
          </CardBody>
        </Card>

        <Card className='shadow-medium'>
          <CardBody className='text-center p-6'>
            <div className='text-3xl font-bold text-green-600 mb-2'>{cotizaciones.filter((q) => q.status === 'accepted').length}</div>
            <p className='text-gray-600'>Cotizaciones Aceptadas</p>
          </CardBody>
        </Card>

        <Card className='shadow-medium'>
          <CardBody className='text-center p-6'>
            <div className='text-3xl font-bold text-purple-600 mb-2'>
              {(
                (cotizaciones.filter((q) => q.status === 'accepted').length /
                  Math.max(cotizaciones.filter((q) => q.status === 'sent').length, 1)) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className='text-gray-600'>Tasa de Conversión</p>
          </CardBody>
        </Card>
      </div> */}
    </div>
  )
}

export default Dashboard
