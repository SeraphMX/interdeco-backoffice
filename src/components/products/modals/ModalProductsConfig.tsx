import { addToast, Button, Modal, ModalBody, ModalContent, ModalHeader, Tab, Tabs } from '@heroui/react'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import AddCategory from '../../forms/AddCategory'
import ConfigTable from '../ConfigTable'

interface ModalProductsConfigProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}
const ModalProductsConfig = ({ isOpen, onOpenChange }: ModalProductsConfigProps) => {
  const rxCategories = useSelector((state: RootState) => state.catalog.categories)
  const rxProviders = useSelector((state: RootState) => state.catalog.providers)
  const rxMeasureUnits = useSelector((state: RootState) => state.catalog.measureUnits)

  const [addCategory, setAddCategory] = useState<boolean>(false)

  return (
    <Modal size='xl' isOpen={isOpen} onOpenChange={onOpenChange}>
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

              <ConfigTable items={rxCategories} />
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
              <ConfigTable items={rxProviders} />
            </Tab>
            <Tab key='measure-units' title='Unidades de medida'>
              <div className='flex justify-between items-center mx-4 mb-2'>
                <span className=''>{rxMeasureUnits.length} Unidades registradas</span>
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
              <ConfigTable items={rxMeasureUnits} />
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ModalProductsConfig
