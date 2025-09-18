import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { updateItem } from '../../../store/slices/quoteSlice'
import { QuoteItem } from '../../../types'

interface ModalAddObservationProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const ModalAddObservation = ({ isOpen, onOpenChange }: ModalAddObservationProps) => {
  const dispatch = useDispatch()
  const selectedItem = useSelector((state: RootState) => state.quote.selectedItem)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'all',
    defaultValues: {
      observations: selectedItem?.observations || ''
    }
  })

  const handleSaveObservation = handleSubmit(
    (data) => {
      console.log(data)

      dispatch(
        updateItem({
          ...selectedItem,
          observations: data.observations
        } as QuoteItem)
      )

      onOpenChange(false)
    },
    (errors) => {
      console.log(errors)
    }
  )

  useEffect(() => {
    if (!selectedItem || !isOpen) return
    reset({ observations: selectedItem?.observations ?? '' })
  }, [selectedItem, isOpen, reset])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='lg' backdrop='opaque'>
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSaveObservation} id='discount-form'>
            <ModalHeader className='flex flex-col gap-1'>Agregar observación</ModalHeader>
            <ModalBody>
              <Controller
                control={control}
                name='observations'
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    placeholder='Agrega un lugar, comentario o indicación...'
                    className='mt-2'
                    isClearable
                    value={field.value ?? ''} // asegura valor controlado
                    onValueChange={field.onChange} // mapea al handler correcto
                    onClear={() => field.onChange('')} // opcional: soporta clear
                  />
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant='light' color='danger' onPress={onClose} tabIndex={-1}>
                Cerrar
              </Button>
              <Button color='primary' isDisabled={!!errors.observations || !watch('observations')} type='submit'>
                Aceptar
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalAddObservation
