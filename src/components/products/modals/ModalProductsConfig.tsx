import {
  addToast,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs
} from '@heroui/react'
import { EllipsisVertical, Plus } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { measureUnits } from '../../../types'
import AddCategory from '../../forms/AddCategory'
interface ModalProductsConfigProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  //onConfirm: () => void
}
const ModalProductsConfig = ({ isOpen, onOpenChange }: ModalProductsConfigProps) => {
  const products = useSelector((state: RootState) => state.productos.items)

  const rxCategories = useSelector((state: RootState) => state.catalog.categories)
  const rxProviders = useSelector((state: RootState) => state.catalog.providers)

  const [addCategory, setAddCategory] = useState<boolean>(false)

  return (
    <Modal size='xl' isOpen={isOpen} onOpenChange={onOpenChange}>
      //TODO: Refactorizar este modal en un componente separado, con las tablas en un componente separado que se comparta por los tres
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>Configuración de opciones</ModalHeader>
        <ModalBody>
          <Tabs aria-label='Configuración' disableAnimation color='primary'>
            <Tab key='categories' title='Categorías'>
              {!addCategory && (
                <div className='flex justify-between items-center mx-4 mb-2'>
                  <span>{rxCategories.length} categorías registradas</span>

                  <Button
                    variant='flat'
                    color='primary'
                    className='mb-2'
                    onPress={() => {
                      console.log('Agregar nueva categoría')
                      setAddCategory(true)
                      // Aquí puedes abrir un modal o formulario para agregar una nueva categoría
                    }}
                  >
                    <Plus size={20} />
                    Agregar categoría
                  </Button>
                </div>
              )}
              {addCategory && (
                <AddCategory
                  onSuccess={(category) => {
                    console.log('Categoría agregada:', category)
                    //setSelectedCategories((prev) => new Set([...prev, category.description]))
                    addToast({
                      title: 'Categoría agregada',
                      description: `La categoría ${category.name} se ha guardado correctamente.`,
                      color: 'success'
                    })
                  }}
                  onCancel={() => setAddCategory(false)}
                />
              )}

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
                    { key: 'description', label: 'Nombre', sortable: true },
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
                <TableBody items={rxCategories}>
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>
                        <Chip className={item.color} size='sm' variant='flat'>
                          {item.description}
                        </Chip>
                      </TableCell>
                      <TableCell align='center'>{products.filter((p) => p.category_description === item.description).length}</TableCell>
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
            </Tab>
            <Tab key='providers' title='Proveedores'>
              <div className='flex justify-between items-center mx-4 mb-2'>
                <span className=''>{rxProviders.length} proveedores registrados</span>
                <Button
                  variant='flat'
                  color='primary'
                  className='mb-2'
                  onPress={() => {
                    console.log('Agregar nuevo proveedor')
                    // Aquí puedes abrir un modal o formulario para agregar una nueva categoría
                  }}
                >
                  <Plus size={20} />
                  Agregar proveedor
                </Button>
              </div>
              <Table
                aria-label='Lista de proveedores'
                selectionMode='single'
                isHeaderSticky
                classNames={{
                  th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600',
                  base: 'max-h-[400px] overflow-auto shadow-small rounded-xl'
                }}
              >
                <TableHeader
                  columns={[
                    { key: 'description', label: 'Nombre' },
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
                <TableBody items={rxProviders}>
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>{item.name}</TableCell>
                      <TableCell>{products.filter((p) => p.provider_name === item.name).length}</TableCell>
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
            </Tab>
            <Tab key='measure-units' title='Unidades de medida'>
              <div className='flex justify-between items-center mx-4 mb-2'>
                <span className=''>{measureUnits.length} Unidades registradas</span>
                <Button
                  variant='flat'
                  color='primary'
                  className='mb-2'
                  onPress={() => {
                    console.log('Agregar nueva unidad')
                    // Aquí puedes abrir un modal o formulario para agregar una nueva categoría
                  }}
                >
                  <Plus size={20} />
                  Agregar unidad
                </Button>
              </div>
              <Table
                aria-label='Unidades de medida'
                selectionMode='single'
                isHeaderSticky
                classNames={{
                  th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600',
                  base: 'max-h-[400px] overflow-auto shadow-small rounded-xl'
                }}
              >
                <TableHeader
                  columns={[
                    { key: 'description', label: 'Nombre' },
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
                <TableBody items={measureUnits}>
                  {(item) => (
                    <TableRow key={item.key}>
                      <TableCell className='max-w-56 whitespace-nowrap text-ellipsis overflow-hidden'>{item.label}</TableCell>
                      <TableCell>{products.filter((p) => p.measurement_unit === item.key).length}</TableCell>
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
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ModalProductsConfig
