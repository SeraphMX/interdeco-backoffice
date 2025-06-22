import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'
import { RootState } from '../../../store'
import { setCalculatedArea } from '../../../store/slices/quoteSlice'

interface ModalAddProductProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const schema = z.object({
  length: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .transform((val) => (isNaN(val) ? undefined : val))
    .optional()
    .refine((val) => typeof val === 'number' && val > 0, {
      message: 'Debe ser mayor a 0'
    }),
  width: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .transform((val) => (isNaN(val) ? undefined : val))
    .optional()
    .refine((val) => typeof val === 'number' && val > 0, {
      message: 'Debe ser mayor a 0'
    })
})

type FormData = z.infer<typeof schema>

const ModalAreaCalculator = ({ isOpen, onOpenChange }: ModalAddProductProps) => {
  const selectedProduct = useSelector((state: RootState) => state.productos.selectedProduct)
  const [totalCalculated, setTotalCalculated] = useState<number>(0)
  const dispatch = useDispatch()

  const {
    register,
    formState: { errors },
    watch,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      length: undefined,
      width: undefined
    }
  })

  const length = watch('length')
  const width = watch('width')

  useEffect(() => {
    const isValid = (n: unknown): n is number => typeof n === 'number' && !isNaN(n) && n > 0

    if (isValid(length) && isValid(width)) {
      setTotalCalculated(Math.ceil(length * width))
    } else {
      setTotalCalculated(0)
    }
  }, [length, width])

  useEffect(() => {
    reset({ length: undefined, width: undefined })
    setTotalCalculated(0)
  }, [onOpenChange, reset])

  const handleSetCalculatedArea = () => {
    dispatch(setCalculatedArea(totalCalculated))
    onOpenChange(false)
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Agregar producto</ModalHeader>
            <ModalBody className='grid grid-cols-2 gap-4'>
              <Input
                {...register('width', { valueAsNumber: true })}
                label='Ancho'
                isInvalid={!!errors.width}
                errorMessage={errors.width?.message}
                onFocus={(e) => e.target.select()}
              />
              <Input
                {...register('length', { valueAsNumber: true })}
                label='Largo'
                isInvalid={!!errors.length}
                errorMessage={errors.length?.message}
                autoFocus
                onFocus={(e) => e.target.select()}
              />
            </ModalBody>
            <ModalFooter className='flex justify-between items-center'>
              <section>
                <Button variant='light' color='danger' onPress={onClose} tabIndex={-1}>
                  Cerrar
                </Button>
              </section>
              <section className='flex gap-2 items-center'>
                {totalCalculated > 0 && (
                  <span className='font-semibold text-lg'>
                    {totalCalculated} m<sup>2</sup>
                  </span>
                )}
                <Button color='primary' onPress={handleSetCalculatedArea} isDisabled={!selectedProduct || totalCalculated === 0}>
                  Aceptar
                </Button>
              </section>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalAreaCalculator
