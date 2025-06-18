import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { updateItem } from '../../../store/slices/quoteSlice'
import { QuoteItem } from '../../../types'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const ModalAddDiscount = ({ isOpen, onOpenChange }: ModalSelectCustomerProps) => {
  const selectedItem = useSelector((state: RootState) => state.quote.selectedItem)
  const dispatch = useDispatch()
  const [discountType, setDiscountType] = useState('percentage')
  const [discountPrice, setDiscountPrice] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  interface DiscountFormValues {
    discountValue: string
    discountType: 'percentage' | 'fixed'
  }

  const {
    register,
    getValues,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<DiscountFormValues>({
    mode: 'onChange',
    defaultValues: {
      discountType: selectedItem?.discountType || 'percentage',
      discountValue: selectedItem?.discount?.toString() || '0'
    }
  })

  const discountValue = watch('discountValue')

  const handleSaveDiscount = () => {
    const discountValue = parseFloat(getValues('discountValue'))
    if (isNaN(discountValue) || discountValue < 0) {
      console.error('Descuento inválido')
      return
    }

    const discount = discountType === 'percentage' ? (selectedItem?.subtotal ?? 0) * (discountValue / 100) : discountValue
    const finalPrice = (selectedItem?.subtotal ?? 0) - discount

    console.log('Descuento aplicado:', discount, 'Precio final:', finalPrice)

    dispatch(
      updateItem({
        ...selectedItem,
        discountType,
        originalSubtotal: selectedItem?.subtotal,
        discount: parseFloat(getValues('discountValue')),
        subtotal: discountPrice
      } as QuoteItem)
    )

    onOpenChange(false)
  }

  useEffect(() => {
    if (!selectedItem) return
    const originalType = selectedItem.discountType || 'percentage'
    console.log('Descuento cambiado:', discountType, 'Original:', originalType)
    const baseSubtotal = selectedItem.originalSubtotal ?? selectedItem.subtotal ?? 0

    if (discountType !== originalType) {
      // Si cambió el tipo, resetea todo
      setValue('discountValue', '0', { shouldValidate: true })
      setDiscountPrice(baseSubtotal)
    } else {
      // Si es el mismo tipo, usa el valor existente
      const rawDiscount = selectedItem.discount ?? 0
      setValue('discountValue', rawDiscount.toString(), { shouldValidate: true })
      const discount = discountType === 'percentage' ? (baseSubtotal * rawDiscount) / 100 : rawDiscount
      setDiscountPrice(baseSubtotal - discount)
    }

    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 100)
  }, [discountType, selectedItem, setValue])

  useEffect(() => {
    if (!selectedItem || !isOpen) return
    console.log('Cargando modal con item:', selectedItem)

    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 100)
  }, [selectedItem, isOpen, reset])

  useEffect(() => {
    if (!selectedItem || !isOpen) return

    const type = selectedItem.discountType || 'percentage'
    const discountRaw = selectedItem.discount ?? 0
    const discountStr = discountRaw.toString()
    const baseSubtotal = selectedItem.discount ? selectedItem.originalSubtotal ?? 0 : selectedItem.subtotal ?? 0

    setDiscountType(type)
    reset({
      discountType: type,
      discountValue: discountStr
    })
    const discount = type === 'percentage' ? (baseSubtotal * discountRaw) / 100 : discountRaw

    setDiscountPrice(baseSubtotal - discount)
  }, [selectedItem, isOpen, reset])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='lg' backdrop='blur'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Agregar descuento</ModalHeader>
            <ModalBody>
              <RadioGroup
                {...register('discountType')}
                label='Elije el tipo de descuento'
                orientation='horizontal'
                value={discountType}
                onValueChange={setDiscountType}
              >
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
                    }).format(selectedItem?.discount ? selectedItem?.originalSubtotal ?? 0 : selectedItem?.subtotal ?? 0)}
                  </span>
                  <small>Precio original</small>
                </div>
                <Input
                  {...register('discountValue', {
                    required: 'Obligatorio',
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
                  ref={(el) => {
                    register('discountValue').ref(el)
                    inputRef.current = el
                  }}
                  value={discountValue.toString()}
                  onChange={(e) => setValue('discountValue', e.target.value, { shouldValidate: true })}
                  onFocus={(e) => e.target.select()}
                  label='Cantidad'
                  className='text-center'
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
              <Button color='primary' isDisabled={!selectedItem} onPress={handleSaveDiscount}>
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
