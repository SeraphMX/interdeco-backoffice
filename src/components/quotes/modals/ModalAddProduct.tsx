import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'
import { RootState } from '../../../store'
import { clearSelectedProduct } from '../../../store/slices/productsSlice'
import { addItem, clearCalculatedArea } from '../../../store/slices/quoteSlice'
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
  const calculatedArea = useSelector((state: RootState) => state.quote.calculatedArea)

  const [filterValue, setFilterValue] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])

  const { isOpen: isOpenAreaCalculator, onOpen: onOpenAreaCalculator, onOpenChange: onOpenChangeAreaCalculator } = useDisclosure()

  const dispatch = useDispatch()
  const quantityInputRef = useRef<HTMLInputElement | null>(null)

  const schema = z.object({
    quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Debe ser un número mayor a 0'
    })
  })

  type FormData = z.infer<typeof schema>

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      quantity: undefined
    }
  })

  const quantity = watch('quantity')

  const handleAddProduct = handleSubmit(
    (data) => {
      console.log('Producto agregado:', data)
      // Aquí puedes manejar la lógica para agregar el producto seleccionado
      if (selectedProduct) {
        const requestedQuantity = Number(data.quantity)
        const packageSize = selectedProduct.package_unit ?? 0
        const packagesRequired = packageSize > 1 ? Math.ceil(requestedQuantity / packageSize) : requestedQuantity
        const roundToTwo = (num: number) => Math.round(num * 100) / 100
        const totalQuantity = roundToTwo(packageSize > 1 ? packagesRequired * packageSize : requestedQuantity)

        const pricePerPackage = Number(
          ((selectedProduct?.price ?? 0) * (1 + (selectedProduct.utility ?? 0) / 100) * (selectedProduct.package_unit ?? 1)).toFixed(2)
        )
        const subtotal = pricePerPackage * packagesRequired
        dispatch(
          addItem({
            product: selectedProduct,
            requiredQuantity: requestedQuantity, // Lo que pidió el usuario (en m²)
            totalQuantity, // Lo que realmente se va a entregar
            packagesRequired, // (opcional) para mostrar cuántos paquetes se requieren
            subtotal // Calcula el subtotal basado en el precio por paquete
            //(item.product?.price * (1 + item.product.utility / 100) * item.product.package_unit)
          })
        )

        dispatch(clearSelectedProduct())
        dispatch(clearCalculatedArea())
      } else {
        console.error('No product selected')
      }

      onOpenChange(false) // Cierra el modal después de agregar el producto
    },
    (errors) => {
      console.error('Errores al agregar producto:', errors)
      // Aquí puedes manejar los errores de validación
    }
  )

  useEffect(() => {
    if (isOpen) {
      dispatch(clearSelectedProduct())
      reset() // Resetea el formulario al abrir el modal
    }
  }, [dispatch, isOpen, reset])

  useEffect(() => {
    if (selectedProduct && quantityInputRef.current) {
      // Espera un pequeño tiempo para asegurar que el input ya esté en el DOM
      setTimeout(() => {
        quantityInputRef.current?.focus()
      }, 100)
    }
  }, [selectedProduct, quantity, reset])
  useEffect(() => {
    setTimeout(() => {
      quantityInputRef.current?.select()
    }, 150)
  }, [selectedProduct])

  useEffect(() => {
    if (calculatedArea !== undefined && calculatedArea > 0) {
      setValue('quantity', calculatedArea.toString(), { shouldValidate: true })
    } else {
      setValue('quantity', '', { shouldValidate: true })
    }
  }, [calculatedArea, setValue])

  useEffect(() => {
    console.log('Selected categories changed:', selectedCategories)
  }, [selectedCategories])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='2xl' backdrop='blur'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Agregar producto</ModalHeader>
            <ModalBody>
              <ProductsFilters
                filters={{
                  search: {
                    value: filterValue,
                    setValue: setFilterValue
                  },
                  categories: {
                    value: selectedCategories,
                    setValue: setSelectedCategories
                  },
                  providers: {
                    value: selectedProviders,
                    setValue: setSelectedProviders
                  }
                }}
              />
              <ProductsTable
                wrapperHeight={400}
                filterValue={filterValue}
                selectedCategories={selectedCategories}
                selectedProviders={selectedProviders}
              />
            </ModalBody>
            <ModalFooter className='flex justify-between items-center'>
              <section>
                <Button variant='light' color='danger' onPress={onClose} tabIndex={-1}>
                  Cerrar
                </Button>
              </section>
              {selectedProduct && (
                <form className='flex gap-2 items-center' onSubmit={handleAddProduct}>
                  <span className='whitespace-nowrap flex flex-col text-right'>
                    {selectedProduct?.provider_name}
                    <small className='max-w-[100px] overflow-hidden truncate'>{selectedProduct?.sku}</small>
                  </span>
                  <Controller
                    control={control}
                    name='quantity'
                    render={({ field }) => (
                      <Input
                        className='w-36'
                        inputMode='decimal'
                        size='sm'
                        label={measureUnits.find((i) => i.key === selectedProduct?.measurement_unit)?.plural}
                        isInvalid={!!errors.quantity}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        ref={(el) => {
                          field.ref(el)
                          quantityInputRef.current = el
                        }}
                      />
                    )}
                  />
                  {selectedProduct.measurement_unit === 'M2' && (
                    <>
                      <Button color='primary' variant='ghost' onPress={onOpenAreaCalculator} isIconOnly tabIndex={-1}>
                        <Calculator size={20} />
                      </Button>
                      <ModalAreaCalculator isOpen={isOpenAreaCalculator} onOpenChange={onOpenChangeAreaCalculator} />
                    </>
                  )}
                  <Button color='primary' type='submit'>
                    Aceptar
                  </Button>
                </form>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalAddProduct
