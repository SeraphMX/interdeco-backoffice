import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
  const [discountPrice, setDiscountPrice] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const previousDiscountTypeRef = useRef<DiscountFormValues['discountType']>()

  const discountValuesRef = useRef<{ percentage: number; fixed: number }>({
    percentage: selectedItem?.discountType === 'percentage' ? selectedItem?.discount ?? 0 : 0,
    fixed: selectedItem?.discountType === 'fixed' ? selectedItem?.discount ?? 0 : 0
  })

  interface DiscountFormValues {
    discountValue: number
    discountType: 'percentage' | 'fixed'
  }

  const {
    getValues,
    watch,
    setValue,
    reset,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<DiscountFormValues>({
    mode: 'all',
    defaultValues: {
      discountType: selectedItem?.discountType || 'percentage',
      discountValue: selectedItem?.discount || 0
    }
  })

  const discountType = watch('discountType')
  const discountValue = watch('discountValue')

  const handleSaveDiscount = handleSubmit(
    async () => {
      const discountValue = getValues('discountValue')
      if (isNaN(discountValue) || discountValue < 0) {
        console.error('Descuento inválido')
        return
      }

      const baseSubtotal = selectedItem?.originalSubtotal ?? selectedItem?.subtotal ?? 0
      const discount = discountType === 'percentage' ? baseSubtotal * (discountValue / 100) : discountValue
      const finalPrice = baseSubtotal - discount

      console.log('Descuento aplicado:', discount, 'Precio final:', finalPrice)

      dispatch(
        updateItem({
          ...selectedItem,
          discountType,
          originalSubtotal: selectedItem?.originalSubtotal ?? selectedItem?.subtotal,
          discount: getValues('discountValue'),
          subtotal: discountPrice
        } as QuoteItem)
      )

      onOpenChange(false)
    },
    (errors) => {
      console.error('Errores de validación:', errors)
    }
  )

  useEffect(() => {
    if (!selectedItem || !isOpen) return

    const type = selectedItem.discountType || 'percentage'
    const discountRaw = selectedItem.discount ?? 0

    // Inicializa el ref, sólo el tipo activo tiene valor guardado, el otro es 0
    discountValuesRef.current = {
      percentage: type === 'percentage' ? discountRaw : 0,
      fixed: type === 'fixed' ? discountRaw : 0
    }

    reset({
      discountType: type,
      discountValue: discountRaw
    })

    const baseSubtotal = selectedItem.originalSubtotal ?? selectedItem.subtotal ?? 0
    const discount = type === 'percentage' ? (baseSubtotal * discountRaw) / 100 : discountRaw
    setDiscountPrice(baseSubtotal - discount)

    previousDiscountTypeRef.current = type
  }, [isOpen, selectedItem, reset])

  //

  useEffect(() => {
    if (!selectedItem) return

    const baseSubtotal = selectedItem.originalSubtotal ?? selectedItem.subtotal ?? 0
    const previousDiscountType = previousDiscountTypeRef.current

    if (previousDiscountType !== discountType) {
      // Si ya tenemos un valor guardado para este tipo, úsalo, si no, pon 0
      const storedValue = discountValuesRef.current[discountType]
      const valueToSet = storedValue !== undefined ? storedValue : 0

      setValue('discountValue', valueToSet, { shouldValidate: true, shouldDirty: true })

      const discount = discountType === 'percentage' ? (baseSubtotal * valueToSet) / 100 : valueToSet
      setDiscountPrice(baseSubtotal - discount)
    }

    previousDiscountTypeRef.current = discountType

    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 100)
  }, [discountType, selectedItem, setValue])

  useEffect(() => {
    if (!selectedItem || !isOpen) return

    const baseSubtotal = selectedItem.originalSubtotal ?? selectedItem.subtotal ?? 0

    const value = discountValue
    if (isNaN(value)) {
      setDiscountPrice(baseSubtotal)
      return
    }

    console.log('porcentaje', discountType === 'percentage', 'valor', value)

    if (discountType === 'percentage' && value == 100) {
      console.log('Cambiar a 0')
      setDiscountPrice(0)
    } else {
      const discount = discountType === 'percentage' ? (baseSubtotal * value) / 100 : value
      const newPrice = Math.round((baseSubtotal - discount) * 100) / 100
      setDiscountPrice(newPrice >= 0 ? newPrice : 0)
    }
  }, [discountValue, discountType, selectedItem, isOpen, reset])

  useEffect(() => {
    if (!selectedItem || !isOpen) return

    const type = selectedItem.discountType || 'percentage'
    const discountRaw = selectedItem.discount ?? 0
    const baseSubtotal = selectedItem.discount ? selectedItem.originalSubtotal ?? 0 : selectedItem.subtotal ?? 0

    const discount = type === 'percentage' ? (baseSubtotal * discountRaw) / 100 : discountRaw

    setDiscountPrice(baseSubtotal - discount)
  }, [selectedItem, isOpen, reset])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='lg' backdrop='opaque'>
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSaveDiscount} id='discount-form'>
            <ModalHeader className='flex flex-col gap-1'>Agregar descuento</ModalHeader>
            <ModalBody>
              <Controller
                name='discountType'
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    label='Elije el tipo de descuento'
                    orientation='horizontal'
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <Radio value='percentage'>Porcentaje</Radio>
                    <Radio value='fixed'>Directo</Radio>
                  </RadioGroup>
                )}
              />

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

                <Controller
                  name='discountValue'
                  control={control}
                  rules={{
                    required: 'Obligatorio',
                    validate: {
                      positive: (value) => {
                        const num = value
                        return (!isNaN(num) && (discountType === 'percentage' ? num >= 0 && num <= 100 : num >= 0)) || 'Descuento inválido'
                      },
                      validDiscount: (value) => {
                        const num = value
                        if (isNaN(num)) return 'Debe ser un número'
                        const discount = discountType === 'percentage' ? ((selectedItem?.subtotal ?? 0) * num) / 100 : num

                        if (discountType === 'percentage' && num > (selectedItem?.product?.utility ?? 0) - 10)
                          return 'No puede ser mayor a la utilidad mínima del producto'

                        if (
                          discountType === 'fixed' &&
                          num > (selectedItem?.subtotal ?? 0) * (((selectedItem?.product?.utility ?? 0) - 10) / 100)
                        )
                          return 'No puede ser mayor a la utilidad mínima del producto'

                        return discount <= (selectedItem?.subtotal ?? 0) || 'El descuento no puede ser mayor al subtotal'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value.toString()}
                      onFocus={(e) => e.target.select()}
                      ref={(el) => {
                        field.ref(el)
                        inputRef.current = el
                      }}
                      label='Cantidad'
                      type='number'
                      classNames={{
                        input: 'text-center',
                        inputWrapper: 'justify-center',
                        label: 'self-center text-center'
                      }}
                      isInvalid={!!errors.discountValue}
                      //errorMessage={}
                    />
                  )}
                />

                <div className='flex flex-col gap-2 justify-center items-center'>
                  <span className='text-lg font-semibold'>
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(discountPrice || 0)}
                  </span>
                  <small>Con descuento</small>
                </div>
              </section>
              <section className='text-danger text-center'>{errors.discountValue?.message}</section>
            </ModalBody>
            <ModalFooter>
              <Button variant='light' color='danger' onPress={onClose} tabIndex={-1}>
                Cerrar
              </Button>
              <Button color='primary' isDisabled={!selectedItem} type='submit'>
                Aceptar
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalAddDiscount
