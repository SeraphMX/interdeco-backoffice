import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure
} from '@heroui/react'
import { EllipsisVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { productService } from '../../services/productService'
import { RootState } from '../../store'
import { setSelectedItem, setShowForm } from '../../store/slices/catalogSlice'
//TODO:Usar mejor los tipos de zod
import { Category, MeasureUnit, Provider } from '../../schemas/catalog.schema'
import ModalConfigConfirmCatalogDelete from './modals/ModalConfigConfirmCatalogDelete'

interface ConfigTableProps {
  type: 'category' | 'provider' | 'measureUnit'
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

const ConfigTable = ({ type, items }: ConfigTableProps) => {
  const dispatch = useDispatch()
  const products = useSelector((state: RootState) => state.productos.items)
  const { selectedItem, showForm } = useSelector((state: RootState) => state.catalog)
  const [itemToDelete, setItemToDelete] = useState<Provider | Category | MeasureUnit | null>(null)

  const { isOpen, onOpenChange, onOpen } = useDisclosure()

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

  const handleConfirmDelete = (item: Provider | Category | MeasureUnit) => {
    setItemToDelete(item)
    onOpen()
  }

  const handleEdit = async (item: Provider | Category | MeasureUnit) => {
    if (type === 'measureUnit') {
      console.log('Editing measure unit:', item)

      dispatch(
        setSelectedItem({
          ...(item as MeasureUnit),
          id: (item as MeasureUnit).key
        })
      )
    } else {
      dispatch(setSelectedItem({ ...item }))
    }
  }

  useEffect(() => {
    // Si showForm es true, aseguramos que selectedItem esté vacío
    if (selectedItem) {
      if (showForm) {
        dispatch(setSelectedItem(null))
        dispatch(setShowForm(false))
      }

      setTimeout(() => {
        dispatch(setShowForm(true))
      }, 200)
    }

    console.log('showForm changed:', showForm, 'selectedItem:', selectedItem)
  }, [showForm, selectedItem, dispatch])

  return (
    <>
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
            <TableRow key={'key' in item ? item.key : item.id}>
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
                <Dropdown placement='left'>
                  <DropdownTrigger>
                    <Button isIconOnly variant='light' color='secondary'>
                      <EllipsisVertical size={20} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label='Opciones del elemento'>
                    <DropdownItem key='edit' onPress={() => handleEdit(item)}>
                      Editar
                    </DropdownItem>
                    <DropdownItem key='delete' className='text-danger' color='danger' onPress={() => handleConfirmDelete(item)}>
                      Eliminar
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ModalConfigConfirmCatalogDelete
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        deleteType={type}
        onConfirm={async () => {
          await productService.deleteCatalogItem(type, itemToDelete)
          onOpenChange()
        }}
        selectedItem={itemToDelete}
      />
    </>
  )
}

export default ConfigTable
