import { Alert, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { TriangleAlert } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Category, MeasureUnit, Provider } from '../../../schemas/catalog.schema'
import { RootState } from '../../../store'

interface ModalConfigConfirmCatalogDeleteProps {
  deleteType: 'category' | 'provider' | 'measureUnit'
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm?: () => void
  selectedItem?: Provider | Category | MeasureUnit | null // o el tipo específico que uses
}

const ModalConfigConfirmCatalogDelete = ({
  deleteType,
  isOpen,
  onOpenChange,
  onConfirm,
  selectedItem
}: ModalConfigConfirmCatalogDeleteProps) => {
  const products = useSelector((state: RootState) => state.productos.items)

  const mapItemContent = {
    category: {
      title: 'Categoría',
      description: deleteType === 'category' && selectedItem && 'description' in selectedItem ? selectedItem.description : ''
    },
    provider: {
      title: 'Proveedor',
      description: deleteType === 'provider' && selectedItem && 'name' in selectedItem ? selectedItem.name : ''
    },
    measureUnit: {
      title: 'Unidad de medida',
      description: deleteType === 'measureUnit' && selectedItem && 'name' in selectedItem ? selectedItem.name : ''
    }
  }

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

  const handleDelete = async () => {
    try {
      onConfirm?.()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Eliminar {mapItemContent[deleteType].title.toLowerCase()}</ModalHeader>
            <ModalBody>
              <div>
                ¿Estas seguro de que quieres eliminar {deleteType === 'provider' ? 'el' : 'la'}{' '}
                {mapItemContent[deleteType].title.toLowerCase()} <strong>{mapItemContent[deleteType].description}</strong> del catálogo?
              </div>
              <Alert
                classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
                hideIconWrapper
                color='danger'
                icon={<TriangleAlert />}
                title='¡Advertencia! Esto no se puede deshacer'
                description={
                  getProductsCount(selectedItem as Provider | Category | MeasureUnit) > 0
                    ? `Hay ${getProductsCount(selectedItem as Provider | Category | MeasureUnit)} productos que usan ${
                        deleteType === 'provider' ? 'este' : 'esta'
                      } ${mapItemContent[deleteType].title.toLowerCase()}. Si ${
                        deleteType === 'provider' ? 'lo' : 'la'
                      } eliminas, todos los productos que ${deleteType === 'provider' ? 'lo' : 'la'} usan se quedarán sin ${mapItemContent[
                        deleteType
                      ].title.toLowerCase()}.`
                    : `No hay productos que usen ${deleteType === 'provider' ? 'este' : 'esta'} ${mapItemContent[
                        deleteType
                      ].title.toLowerCase()},  Sin embargo, si ${deleteType === 'provider' ? 'lo' : 'la'} eliminas no podrás ${
                        deleteType === 'provider' ? 'usarlo' : 'usarla'
                      } en ningun producto.`
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button color='primary' variant='light' onPress={onClose}>
                Cancelar
              </Button>
              <Button type='submit' form='add-product-form' color='danger' onPress={handleDelete}>
                Eliminar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalConfigConfirmCatalogDelete
