import { Button, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'
import { EllipsisVertical } from 'lucide-react'

const quoteHistory = [
  {
    id: 1,
    date: '22/01/2025',
    amount: 1500,
    status: 'enviada'
  },
  {
    id: 2,
    date: '23/01/2025',
    amount: 2000,
    status: 'enviada'
  },
  {
    id: 3,
    date: '24/01/2025',
    amount: 2500,
    status: 'enviada'
  }
]

const CustomerHistory = () => {
  return (
    <Table
      aria-label='Categorias de productos'
      selectionMode='single'
      isHeaderSticky
      classNames={{
        th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600',
        base: 'max-h-[400px] overflow-auto shadow-small rounded-xl'
      }}
    >
      <TableHeader
        columns={[
          { key: 'date', label: 'Fecha', sortable: true },
          { key: 'amount', label: 'Monto', align: 'end', sortable: true },
          { key: 'status', label: 'Status', align: 'center', sortable: true },
          { key: 'actions', label: 'Acciones', align: 'center' }
        ]}
      >
        {(column) => (
          <TableColumn key={column.key} align={(column.align as 'center' | 'start' | 'end' | undefined) || 'start'}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={quoteHistory}>
        {(item) => (
          <TableRow key={item.id}>
            <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>{item.date}</TableCell>
            <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>
              {item.amount.toLocaleString('es-MX', {
                style: 'currency',
                currency: 'MXN'
              })}
            </TableCell>
            <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>
              <Chip variant='solid' color={item.status === 'enviada' ? 'primary' : 'default'} className='text-xs font-medium'>
                {item.status}
              </Chip>
            </TableCell>

            <TableCell>
              <Button
                isIconOnly
                variant='light'
                color='secondary'
                onPress={() => {
                  console.log('Editar categoría:', item)
                  // Aquí puedes abrir un modal o formulario para editar la categoría
                }}
              >
                <EllipsisVertical size={20} />
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default CustomerHistory
