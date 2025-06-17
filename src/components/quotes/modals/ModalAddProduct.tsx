import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/react'
import { Calculator } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { measureUnits } from '../../../types'
import ProductsFilters from '../../products/ProductsFilters'
import ProductsTable from '../../products/ProductsTable'
import ModalAreaCalculator from './ModalAreaCalculator'

interface ModalAddProductProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const ModalAddProduct = ({ isOpen, onOpenChange }: ModalAddProductProps) => {
  const selectedProduct = useSelector((state: RootState) => state.productos.selectedProduct)
  const [selectedQuantity, setSelectedQuantity] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const { isOpen: isOpenAreaCalculator, onOpen: onOpenAreaCalculator, onOpenChange: onOpenChangeAreaCalculator } = useDisclosure()

  useEffect(() => {
    setSelectedQuantity('')
  }, [selectedProduct])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='2xl' backdrop='blur'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Agregar producto</ModalHeader>
            <ModalBody>
              <ProductsFilters filterValue={filterValue} setFilterValue={setFilterValue} />
              <ProductsTable
                wrapperHeight={400}
                filterValue={filterValue}
                selectedCategories={new Set([])}
                selectedProviders={new Set([])}
              />
            </ModalBody>
            <ModalFooter className='flex justify-between items-center'>
              <section>
                <Button variant='light' color='danger' onPress={onClose} tabIndex={-1}>
                  Cerrar
                </Button>
              </section>
              {selectedProduct && (
                <section className='flex gap-2 items-center '>
                  <span className='whitespace-nowrap flex flex-col text-right'>
                    {selectedProduct?.provider_name}
                    <small className='max-w-[100px] overflow-hidden truncate'>{selectedProduct?.sku}</small>
                  </span>
                  <Input
                    className='w-36'
                    size='sm'
                    label={measureUnits.find((i) => i.key === selectedProduct?.measurement_unit)?.plural}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    value={selectedQuantity}
                  ></Input>
                  {selectedProduct.measurement_unit === 'M2' && (
                    <>
                      <Button color='primary' variant='ghost' onPress={onOpenAreaCalculator} isIconOnly>
                        <Calculator size={20} />
                      </Button>
                      <ModalAreaCalculator isOpen={isOpenAreaCalculator} onOpenChange={onOpenChangeAreaCalculator} />
                    </>
                  )}
                  <Button color='primary' onPress={onClose}>
                    Aceptar
                  </Button>
                </section>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalAddProduct
