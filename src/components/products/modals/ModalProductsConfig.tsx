import { Modal, ModalBody, ModalContent, ModalHeader, Tab, Tabs } from '@heroui/react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { setShowForm } from '../../../store/slices/catalogSlice'
import ConfigCatalogHandler from '../ConfigCatalogHandler'
import ConfigTable from '../ConfigTable'

interface ModalProductsConfigProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}
const ModalProductsConfig = ({ isOpen, onOpenChange }: ModalProductsConfigProps) => {
  const dispatch = useDispatch()
  const rxCategories = useSelector((state: RootState) => state.catalog.categories)
  const rxProviders = useSelector((state: RootState) => state.catalog.providers)
  const rxMeasureUnits = useSelector((state: RootState) => state.catalog.measureUnits)

  return (
    <Modal size='xl' isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>Configuración de catálogos</ModalHeader>
        <ModalBody>
          <Tabs aria-label='Configuración' disableAnimation color='primary' onSelectionChange={() => dispatch(setShowForm(false))}>
            <Tab key='categories' title='Categorías'>
              <ConfigCatalogHandler type='category' />
              <ConfigTable type='category' items={rxCategories} />
            </Tab>
            <Tab key='providers' title='Proveedores'>
              <ConfigCatalogHandler type='provider' />
              <ConfigTable type='provider' items={rxProviders} />
            </Tab>
            <Tab key='measure-units' title='Unidades de medida'>
              <ConfigCatalogHandler type='measureUnit' />
              <ConfigTable type='measureUnit' items={rxMeasureUnits} />
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ModalProductsConfig
