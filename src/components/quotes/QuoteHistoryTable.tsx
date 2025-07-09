import { Chip, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'
import { Monitor, TabletSmartphone } from 'lucide-react'
import { useSelector } from 'react-redux'
import { UAParser } from 'ua-parser-js'
import { RootState } from '../../store'
import { quoteActions, QuoteLogItem, uiColors } from '../../types'
import { formatDate } from '../../utils/date'

const QuoteHistoryTable = () => {
  const rxQuote = useSelector((state: RootState) => state.quote)

  return (
    <Table
      aria-label='Historial de la cotizacion'
      selectionMode='single'
      disallowEmptySelection
      isHeaderSticky
      classNames={{
        th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600',
        base: 'max-h-[400px] overflow-auto shadow-small rounded-xl'
      }}
    >
      <TableHeader
        columns={[
          { key: 'date', label: 'Fecha', sortable: true },
          { key: 'action', label: 'Acción', align: 'start', sortable: true },
          { key: 'user', label: 'Usuario', align: 'center', sortable: true },
          { key: 'details', label: 'Detalles', align: 'center' }
        ]}
      >
        {(column) => (
          <TableColumn key={column.key} align={(column.align as 'center' | 'start' | 'end' | undefined) || 'start'}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={rxQuote.data.history || []}
        //isLoading={loading}
        loadingContent={<Spinner label='Cargando historial de la cotizacíon...' />}
        emptyContent='No hay cotizaciones disponibles'
      >
        {(historyLog: QuoteLogItem) => {
          const uaString = historyLog.user_agent || ''
          const parser = new UAParser(uaString)
          const result = parser.getResult()

          const deviceType = result.device.type || 'desktop'
          const browserName = result.browser.name || 'Navegador desconocido'
          const osName = result.os.name || 'OS desconocido'

          return (
            <TableRow key={historyLog.id}>
              <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>
                {historyLog.created_at ? formatDate(historyLog.created_at, { style: 'long' }) : 'Fecha no disponible'}
              </TableCell>

              <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>
                <Chip
                  variant='bordered'
                  color={quoteActions.find((a) => a.key === historyLog.action)?.color as uiColors}
                  className='text-xs font-medium '
                >
                  {quoteActions.find((a) => a.key === historyLog.action)?.label}
                </Chip>
              </TableCell>
              <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>{historyLog.user_id ?? 'Público'}</TableCell>

              <TableCell className='flex items-center justify-center gap-2'>
                {deviceType == 'mobile' ? <TabletSmartphone /> : <Monitor />}
                {uaString && (
                  <div className='flex flex-col items-start'>
                    <span className='text-xs font-semibold'>{deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}</span>
                    <span className='text-xs'>
                      {browserName} ({osName})
                    </span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          )
        }}
      </TableBody>
    </Table>
  )
}

export default QuoteHistoryTable
