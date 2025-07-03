import { Alert, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { TriangleAlert } from 'lucide-react'
import { useSelector } from 'react-redux'
import { productService } from '../../../services/productService'
import { RootState } from '../../../store'
interface ModalProductConfirmDeleteProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm?: () => void
}
const ModalProductConfirmDelete = ({ isOpen, onOpenChange, onConfirm }: ModalProductConfirmDeleteProps) => {
  const selectedProduct = useSelector((state: RootState) => state.productos.selectedProduct)

  const handleDelete = async () => {
    if (!selectedProduct) return
    try {
      await productService.deleteProduct(selectedProduct)
      console.log('Producto eliminado:', selectedProduct)
      onConfirm?.()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Eliminar producto</ModalHeader>
            <ModalBody>
              <div>
                Estas seguro que deseas eliminar el producto <strong>{selectedProduct?.spec}</strong> del catálogo?
              </div>
              <Alert
                classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
                hideIconWrapper
                color='danger'
                icon={<TriangleAlert />}
                title='Esto no se puede deshacer'
              />
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                Cancelar
              </Button>
              <Button type='submit' form='add-product-form' color='primary' onPress={handleDelete}>
                Eliminar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalProductConfirmDelete
