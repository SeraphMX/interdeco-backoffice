import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import AddProduct from '../../forms/AddProduct'
interface ModalProductAddProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  //onConfirm: () => void
}
const ModalProductAdd = ({ isOpen, onOpenChange }: ModalProductAddProps) => {
  return (
    <Modal size='xl' isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Agregar producto</ModalHeader>
            <ModalBody>
              <AddProduct
                onSuccess={(product) => {
                  console.log('Producto agregado:', product)

                  //   console.log(products)

                  //   setProducts((prev) => [...prev, product])
                  //   setSelectedProduct(product)

                  onClose()
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                Close
              </Button>
              <Button type='submit' form='add-product-form' color='primary'>
                Guardar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalProductAdd
