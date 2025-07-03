import { Button, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'
import { EllipsisVertical } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { Category, MeasureUnit, Provider } from '../../types'

interface ConfigTableProps {
  items: (Provider | Category | MeasureUnit)[]
}

const getLabel = (item: Provider | Category | MeasureUnit) => {
  // Si tiene description, úsalo, si no, usa name
  return 'description' in item ? item.description : item.name
}

const getColor = (item: Provider | Category | MeasureUnit) => {
  // Si tiene color, úsalo, si no, retorna string vacío
  return 'color' in item && item.color ? item.color : ''
}

const ConfigTable = ({ items }: ConfigTableProps) => {
  const products = useSelector((state: RootState) => state.productos.items)

  // Función para contar productos según el tipo de item
  const getProductsCount = (item: Provider | Category | MeasureUnit) => {
    if ('description' in item) {
      // Category
      return products.filter((p) => p.category_description === item.description).length
    }
    if ('name' in item && 'id' in item) {
      // Provider
      return products.filter((p) => p.provider_name === item.name).length
    }
    if ('name' in item && 'key' in item) {
      // MeasureUnit
      return products.filter((p) => p.measurement_unit === item.key).length
    }
    return 0
  }

  return (
    <Table
      aria-label='Configuración'
      selectionMode='single'
      isHeaderSticky
      classNames={{
        th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600',
        base: 'max-h-[400px] overflow-auto shadow-small rounded-xl'
      }}
    >
      <TableHeader
        columns={[
          { key: 'label', label: 'Nombre', sortable: true },
          { key: 'products', label: 'Productos', align: 'center', sortable: true },
          { key: 'actions', label: 'Acciones', align: 'center' }
        ]}
      >
        {(column) => (
          <TableColumn key={column.key} align={(column.align as 'center' | 'start' | 'end' | undefined) || 'start'}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={items}>
        {(item) => (
          <TableRow key={'id' in item ? item.id : item.key}>
            <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>
              {'description' in item ? (
                <Chip className={getColor(item)} size='sm' variant='flat'>
                  {getLabel(item)}
                </Chip>
              ) : (
                getLabel(item)
              )}
            </TableCell>
            <TableCell align='center'>{getProductsCount(item)}</TableCell>
            <TableCell>
              <Button
                isIconOnly
                variant='light'
                color='secondary'
                onPress={() => {
                  console.log('Editar:', item)
                  // Aquí puedes abrir un modal o formulario para editar el item
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

export default ConfigTable
