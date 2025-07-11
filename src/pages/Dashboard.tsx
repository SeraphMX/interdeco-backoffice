import { Button, Card, CardBody, CardHeader, Chip, Tab, Tabs } from '@heroui/react'
import { Eye, FileText, Package, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store'
import { Quote, quoteStatus, uiColors } from '../types'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'
import { getQuoteID } from '../utils/strings'

const Dashboard = () => {
  const navigate = useNavigate()
  const clientes = useSelector((state: RootState) => state.clientes.items)
  const cotizaciones = useSelector((state: RootState) => state.quotes.items)
  const productos = useSelector((state: RootState) => state.productos.items)

  const [selectedChart, setSelectedChart] = useState('mas-utilizados')
  const [chartTitle, setChartTitle] = useState('Materiales Más Utilizados')
  const [chartSubtitle, setChartSubtitle] = useState('Últimos 30 días')
  const [selectedQuoteTab, setSelectedQuoteTab] = useState('ultimas')
  const [quoteTabTitle, setQuoteTabTitle] = useState('Últimas Cotizaciones')
  const [quoteTabSubtitle, setQuoteTabSubtitle] = useState('')

  const stats = [
    { title: 'Clientes', value: clientes.length, icon: Users, color: 'bg-blue-500' },
    { title: 'Productos', value: productos.length, icon: Package, color: 'bg-green-500' },
    { title: 'Cotizaciones', value: cotizaciones.length, icon: FileText, color: 'bg-purple-500' },
    {
      title: 'Total Ventas',
      value: formatCurrency(cotizaciones.reduce((acc, curr) => acc + curr.total, 0)),
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  // Obtener las últimas 5 cotizaciones ordenadas por fecha
  const ultimasCotizaciones = [...cotizaciones]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5)

  const handlePreviewQuote = (quote: Quote) => {
    if (quote.access_token) {
      window.open(`/cotizacion/${quote.access_token}`, '_blank')
    }
  }

  // Simulación de cotizaciones próximas a expirar
  const getExpiringQuotes = () => {
    // Tomar algunas cotizaciones y simular que están próximas a expirar
    return ultimasCotizaciones.slice(0, 3).map((quote) => ({
      ...quote,
      daysToExpire: Math.floor(Math.random() * 3) + 1 // 1-3 días
    }))
  }

  const expiringQuotes = getExpiringQuotes()
  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>

      {/* Stats Cards */}
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
        {/* Sección de Cotizaciones con Tabs */}
        <Card className='shadow-medium'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between w-full'>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>{quoteTabTitle}</h2>
                {quoteTabSubtitle && <p className='text-sm text-gray-500 mt-1'>{quoteTabSubtitle}</p>}
              </div>
              {selectedQuoteTab === 'ultimas' && (
                <Button size='sm' variant='ghost' color='primary' onPress={() => navigate('/cotizaciones')}>
                  Ver todas
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody className='space-y-4'>
            <Tabs
              selectedKey={selectedQuoteTab}
              onSelectionChange={(key) => {
                setSelectedQuoteTab(key as string)
                if (key === 'ultimas') {
                  setQuoteTabTitle('Últimas Cotizaciones')
                  setQuoteTabSubtitle('')
                } else if (key === 'expirando') {
                  setQuoteTabTitle('Próximas a Expirar')
                  setQuoteTabSubtitle('Cotizaciones que vencen pronto')
                }
              }}
              color='primary'
              variant='underlined'
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
              <Tab key='montos' title='Montos'></Tab>
            </Tabs>

            <div className='mt-6'>
              {selectedQuoteTab === 'ultimas' && (
                <div className='space-y-4'>
                  {ultimasCotizaciones.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <FileText className='mx-auto h-12 w-12 mb-3 opacity-50' />
                      <p>No hay cotizaciones disponibles</p>
                    </div>
                  ) : (
                    ultimasCotizaciones.map((quote) => {
                      const cliente = clientes.find((c) => c.id === quote.customer_id)
                      const statusConfig = quoteStatus.find((s) => s.key === quote.status)

                      return (
                        <div
                          key={quote.id}
                          className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                        >
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-3 mb-2'>
                              <span className='font-semibold text-gray-900'>#{getQuoteID(quote)}</span>
                              <Chip size='sm' variant='flat' color={statusConfig?.color as uiColors} className='capitalize'>
                                {statusConfig?.label}
                              </Chip>
                            </div>
                            <p className='font-medium text-gray-700 truncate'>{cliente?.name || 'Cliente no disponible'}</p>
                            <div className='flex items-center justify-between mt-2'>
                              <p className='text-sm text-gray-500'>
                                {quote.created_at ? formatDate(quote.created_at, { style: 'short' }) : 'Fecha no disponible'}
                              </p>
                              <p className='font-bold text-green-600'>{formatCurrency(quote.total)}</p>
                            </div>
                          </div>
                          <div className='ml-4 flex items-center gap-2'>
                            <Button
                              isIconOnly
                              size='sm'
                              variant='ghost'
                              color='primary'
                              onPress={() => handlePreviewQuote(quote)}
                              isDisabled={!quote.access_token}
                              title='Vista previa'
                            >
                              <Eye size={16} />
                            </Button>
                          </div>
                        </div>
                      )
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
                      const cliente = clientes.find((c) => c.id === quote.customer_id)
                      const statusConfig = quoteStatus.find((s) => s.key === quote.status)

                      return (
                        <div key={quote.id} className='flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-3 mb-2'>
                              <span className='font-semibold text-gray-900'>#{getQuoteID(quote)}</span>
                              <Chip size='sm' variant='flat' color='danger' className='capitalize'>
                                Expira en {quote.daysToExpire} día{quote.daysToExpire > 1 ? 's' : ''}
                              </Chip>
                              <Chip size='sm' variant='flat' color={statusConfig?.color as uiColors} className='capitalize'>
                                {statusConfig?.label}
                              </Chip>
                            </div>
                            <p className='font-medium text-gray-700 truncate'>{cliente?.name || 'Cliente no disponible'}</p>
                            <div className='flex items-center justify-between mt-2'>
                              <p className='text-sm text-gray-500'>
                                {quote.created_at ? formatDate(quote.created_at, { style: 'short' }) : 'Fecha no disponible'}
                              </p>
                              <p className='font-bold text-green-600'>{formatCurrency(quote.total)}</p>
                            </div>
                          </div>
                          <div className='ml-4 flex items-center gap-2'>
                            <Button
                              isIconOnly
                              size='sm'
                              variant='ghost'
                              color='primary'
                              onPress={() => handlePreviewQuote(quote)}
                              isDisabled={!quote.access_token}
                              title='Vista previa'
                            >
                              <Eye size={16} />
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
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
              <Tab key='categorias-proveedores' title='Cat. x Prov.'></Tab>
              <Tab key='distribucion' title='Distribución'></Tab>
            </Tabs>

            <div className='mt-6'></div>
          </CardBody>
        </Card>
      </div>

      {/* Resumen adicional */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
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
      </div>
    </div>
  )
}

export default Dashboard
