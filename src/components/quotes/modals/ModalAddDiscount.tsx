import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@heroui/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const ModalAddDiscount = ({ isOpen, onOpenChange }: ModalSelectCustomerProps) => {
  const selectedItem = useSelector((state: RootState) => state.quote.selectedItem)
  const dispatch = useDispatch()
  const [discountType, setDiscountType] = useState('percentage')
  const [discountPrice, setDiscountPrice] = useState(0)

  interface DiscountFormValues {
    discountValue: string
  }

  const {
    register,
    trigger,
    getValues,
    watch,
    setValue,
    formState: { errors }
  } = useForm<DiscountFormValues>({
    mode: 'onChange',
    defaultValues: {
      discountValue: '0'
    }
  })

  const discountValue = watch('discountValue')

  const handleCalculateDiscount = async (value: number) => {
    if (discountType === 'percentage') {
      // Calculate percentage discount
      const finalPrice = selectedItem ? selectedItem.subtotal - (selectedItem.subtotal * value) / 100 : 0
      setDiscountPrice(finalPrice)
      return selectedItem ? (selectedItem.subtotal * value) / 100 : 0
    } else {
      // Fixed amount discount
      const finalPrice = selectedItem ? selectedItem.subtotal - value : 0
      setDiscountPrice(finalPrice)
      return value
    }
  }

  const handleApplyDiscount = async () => {
    const isValid = await trigger('discountValue')
    if (isValid) {
      const discount = handleCalculateDiscount(parseInt(getValues('discountValue')))
      // Aquí haces lo que necesites con el descuento
      console.log('Descuento válido:', discount)
    } else {
      console.log('Error de validación')
    }
  }

  useEffect(() => {
    console.log('Discount type changed:', discountType)
    // Reset discount value when changing discount type
    setDiscountPrice(0)
    setValue('discountValue', '0')
  }, [discountType, setValue])

  useEffect(() => {
    if (!selectedItem) return

    const value = parseFloat(discountValue)
    if (isNaN(value)) {
      setDiscountPrice(selectedItem.subtotal) // No calcules si no es válido
      return
    }

    const subtotal = selectedItem.subtotal
    const discount = discountType === 'percentage' ? (subtotal * value) / 100 : value

    setDiscountPrice(subtotal - discount)
  }, [discountValue, discountType, selectedItem])

  useEffect(() => {
    console.log('modal open state changed:', isOpen)
    setValue('discountValue', '0')
    setDiscountPrice(0)
  }, [isOpen, selectedItem, setValue])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='lg' backdrop='blur'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Agregar descuento</ModalHeader>
            <ModalBody>
              <RadioGroup label='Elije el tipo de descuento' orientation='horizontal' value={discountType} onValueChange={setDiscountType}>
                <Radio value='percentage'>Porcentaje</Radio>
                <Radio value='fixed'>Directo</Radio>
              </RadioGroup>

              <section className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                <div className='flex flex-col gap-2 justify-center items-center'>
                  <span className='text-lg font-semibold'>
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(selectedItem?.subtotal || 0)}
                  </span>
                  <small>Precio original</small>
                </div>
                <Input
                  {...register('discountValue', {
                    required: 'Este campo es obligatorio',
                    validate: {
                      positive: (value) => {
                        const num = parseFloat(value)
                        return (!isNaN(num) && (discountType === 'percentage' ? num >= 0 && num <= 100 : num >= 0)) || 'Inválido'
                      },
                      validDiscount: (value) => {
                        const num = parseFloat(value)
                        if (isNaN(num)) return 'Debe ser un número'
                        const discount = discountType === 'percentage' ? ((selectedItem?.subtotal ?? 0) * num) / 100 : num
                        return discount <= (selectedItem?.subtotal ?? 0) || 'El descuento no puede ser mayor al subtotal'
                      }
                    }
                  })}
                  value={discountValue.toString()} // <-- esto lo hace controlado y visible
                  onChange={(e) => setValue('discountValue', e.target.value, { shouldValidate: true })}
                  onBlur={handleApplyDiscount}
                  label='Cantidad'
                  className='text-center'
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  classNames={{
                    input: 'text-center',
                    inputWrapper: 'justify-center',
                    label: 'self-center text-center'
                  }}
                  isInvalid={!!errors.discountValue}
                  errorMessage={errors.discountValue?.message}
                />
                <div className='flex flex-col gap-2 justify-center items-center'>
                  <span className='text-lg font-semibold'>
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(discountPrice || selectedItem?.subtotal || 0)}
                  </span>
                  <small>Con descuento</small>
                </div>
              </section>
            </ModalBody>
            <ModalFooter>
              <Button variant='light' color='danger' onPress={onClose}>
                Cerrar
              </Button>
              <Button color='primary' isDisabled={!selectedItem} onPress={onClose}>
                Aceptar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalAddDiscount
