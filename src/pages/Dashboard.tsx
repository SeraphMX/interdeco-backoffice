import { Button, Card, CardBody, CardHeader, Select, SelectItem, Spinner, Tab, Tabs } from '@heroui/react'
import { motion } from 'framer-motion'
import { FileText, Package, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CategoryProviderChart from '../components/dashboard/charts/CategoryProviderChart'
import DistributionChart from '../components/dashboard/charts/DistributionChart'
import MostUsedChart from '../components/dashboard/charts/MostUsedChart'
import QuoteAmountChart from '../components/dashboard/charts/QuoteAmountChart'
import QuoteStatusChart from '../components/dashboard/charts/QuoteStatusChart'
import QuoteSummary from '../components/dashboard/QuoteSummary'
import CountUp from '../components/shared/CountUp'
import { useProductsMetrics } from '../hooks/useProductsMetrics'
import { RootState } from '../store'
import { Quote } from '../types'

const Dashboard = () => {
  const navigate = useNavigate()
  const customers = useSelector((state: RootState) => state.clientes.items)
  const { items: quotes, loading } = useSelector((state: RootState) => state.quotes)
  const productos = useSelector((state: RootState) => state.productos.items)

  const [selectedChart, setSelectedChart] = useState('mas-utilizados')
  const [quoteProductsSubtitle, setquoteProductsSubtitle] = useState('Los productos mas utilizados en las cotizaciones')
  const [selectedQuoteTab, setSelectedQuoteTab] = useState('ultimas')
  const [quoteTabSubtitle, setQuoteTabSubtitle] = useState('Las cotizaciones más recientes')

  useProductsMetrics()

  const quotesTotal = quotes.reduce((acc, curr) => acc + curr.total, 0)

  interface Stat {
    title: string
    value: number
    icon: React.ElementType
    color: string
    type?: 'currency' | 'number' | 'currency-short'
  }

  const stats: Stat[] = [
    { title: 'Clientes', value: customers.length, icon: Users, color: 'bg-blue-500' },
    { title: 'Productos', value: productos.length, icon: Package, color: 'bg-green-500' },
    { title: 'Cotizaciones', value: quotes.length, icon: FileText, color: 'bg-purple-500' },
    {
      title: 'Total cotizado',
      value: quotesTotal,
      icon: TrendingUp,
      color: 'bg-orange-500',
      type: isMobile ? 'currency-short' : 'currency'
    }
  ]

  // Obtener las últimas 5 cotizaciones ordenadas por fecha
  const lastQuotes = [...quotes.filter((q) => q.status !== 'archived' && q.status !== 'expired')]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 10)

  // Simulación de cotizaciones próximas a expirar
  // Próximas a expirar (rellenando con expiradas si faltan)
  const getExpiringQuotes = () => {
    const MS_PER_DAY = 86_400_000
    const startOfDay = (d: Date) => {
      const x = new Date(d)
      x.setHours(0, 0, 0, 0)
      return x
    }

    const nowStart = startOfDay(new Date())

    // Solo con fecha y no archivadas
    const withDate = quotes.filter((q) => ['open', 'opened', 'sent'].includes(q.status) && !!q.expiration_date)

    // Helper para setear daysToExpire (0 si ya venció o es hoy; >0 si es futuro)
    const decorateDaysRemaining = (q: Quote): Quote => {
      const exp = startOfDay(new Date(q.expiration_date!))
      const diffDays = Math.round((exp.getTime() - nowStart.getTime()) / MS_PER_DAY)
      return { ...q, daysToExpire: diffDays > 0 ? diffDays : 0 }
    }

    // Próximas (incluye "hoy"); orden asc por expiración
    const upcoming = withDate
      .filter((q) => {
        const exp = startOfDay(new Date(q.expiration_date!))
        return exp.getTime() >= nowStart.getTime() && q.status !== 'expired'
      })
      .sort((a, b) => new Date(a.expiration_date!).getTime() - new Date(b.expiration_date!).getTime())
      .map(decorateDaysRemaining)

    // Expiradas para completar (las más recientes primero)
    const expiredFillers = withDate
      .filter((q) => {
        const exp = startOfDay(new Date(q.expiration_date!))
        return exp.getTime() < nowStart.getTime() || q.status === 'expired'
      })
      .sort((a, b) => new Date(b.expiration_date!).getTime() - new Date(a.expiration_date!).getTime())
      .map(decorateDaysRemaining)

    // Hasta 10: primero próximas, luego expiradas (sin duplicar)
    const result: Quote[] = [...upcoming.slice(0, 10)]
    if (result.length < 10) {
      for (const q of expiredFillers) {
        if (!result.some((t) => t.id === q.id)) result.push(q)
        if (result.length === 10) break
      }
    }
    return result
  }

  const handleQuoteTabTitleChange = (subtitle: string) => {
    setQuoteTabSubtitle(subtitle)
  }

  const handleTitleChange = (title: string, subtitle: string) => {
    setChartTitle(title)
    setquoteProductsSubtitle(subtitle)
  }

  const expiringQuotes = getExpiringQuotes()

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15 // tiempo entre cada hijo
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, type: 'spring', stiffness: 200, damping: 15 } }
  }
  return (
    <section className='space-y-6 flex flex-col h-full '>
      <header className='flex items-center justify-between '>
        <h1 className='text-3xl font-bold text-gray-900 '>Dashboard</h1>
        <div className='w-32 hidden'>
          //TODO:Manejar periodo de tiempo para las estadisticas
          <Select className='max-w-xs' defaultSelectedKeys={['days']} disallowEmptySelection>
            <SelectItem key='days'>Semana</SelectItem>
            <SelectItem key='weeks'>Mes</SelectItem>
            <SelectItem key='months'>Año</SelectItem>
            <SelectItem key='all'>Todo</SelectItem>
          </Select>
        </div>
      </header>

      {/* Stats Cards */}
      <motion.div
        className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'
        variants={containerVariants}
        initial='hidden'
        animate='show'
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants} className='bg-white rounded-lg shadow p-3 md:p-4'>
            <div className='flex items-center'>
              <div className={`${stat.color} p-3 sm:p-4 rounded-lg`}>
                <stat.icon className='h-6 w-6 text-white' />
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-500'>{stat.title}</p>
                <p className='text-lg font-semibold text-gray-900'>
                  <CountUp value={stat.value} type={stat.type ?? 'number'} />
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        layout
        className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:flex-grow lg:min-h-0 pb-6 lg:pb-0'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut', delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
      >
        {/* Sección de Cotizaciones con Tabs */}
        <Card className='shadow-medium max-h-[590px] sm:max-h-max '>
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
              <Tab key='expirando' title='Expirando'></Tab>
              <Tab key='status' title='Estado'></Tab>
              <Tab key='total' title='Historial'></Tab>
            </Tabs>
          </CardHeader>
          <CardBody className='space-y-4  overflow-y-auto h-full'>
            <div className={` ${loading && 'h-full flex items-center justify-center'} gap-6`}>
              {selectedQuoteTab === 'ultimas' && (
                <div className='space-y-4 text-center'>
                  {loading && <Spinner className='my-8' size='lg' color='primary' label='Cargando cotizaciones...' />}
                  {lastQuotes.length === 0 && !loading ? (
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
              {selectedQuoteTab === 'total' && <QuoteAmountChart />}
            </div>
          </CardBody>
        </Card>

        {/* Gráficos con Tabs */}
        <Card className='shadow-medium'>
          <CardHeader className='flex flex-col items-start pb-1'>
            <div className=''>
              <h2 className='text-xl font-bold text-gray-900'>Productos</h2>
              <p className='text-sm text-gray-500 mt-1'>{quoteProductsSubtitle}</p>
            </div>
            <Tabs
              selectedKey={selectedChart}
              onSelectionChange={(key) => {
                setSelectedChart(key as string)
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
              <Tab key='mas-utilizados' title='Más Utilizados'></Tab>
              <Tab key='distribucion' title='Distribución'></Tab>
              <Tab key='categorias-proveedores' title='Categorías por proveedor'></Tab>
            </Tabs>
          </CardHeader>
          <CardBody>
            <div className=' flex-grow min-h-0 flex flex-col gap-6'>
              {selectedChart === 'mas-utilizados' && <MostUsedChart onTitleChange={handleTitleChange} />}
              {selectedChart === 'categorias-proveedores' && <CategoryProviderChart onTitleChange={handleTitleChange} />}
              {selectedChart === 'distribucion' && <DistributionChart onTitleChange={handleTitleChange} />}
            </div>
          </CardBody>
        </Card>
      </motion.div>

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
    </section>
  )
}

export default Dashboard
