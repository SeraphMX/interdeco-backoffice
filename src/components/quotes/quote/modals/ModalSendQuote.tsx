import { Alert, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { sendQuoteMailSchema, sendQuoteWhatsappSchema } from '../../../../schemas/quote.schema'
import { quoteService } from '../../../../services/quoteService'
import { RootState } from '../../../../store'

interface ModalSelectCustomerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
}

const ModalSendQuote = ({ isOpen, onOpenChange, onConfirm }: ModalSelectCustomerProps) => {
  const rxQuote = useSelector((state: RootState) => state.quote)
  const [sendType, setSendType] = useState<'email' | 'whatsapp'>('email')
  const [isLoading, setIsLoading] = useState(false)

  const emailForm = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(sendQuoteMailSchema),
    defaultValues: { email: rxQuote.selectedCustomer?.email || '' }
  })

  const whatsappForm = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(sendQuoteWhatsappSchema),
    defaultValues: { phone: rxQuote.selectedCustomer?.phone || '' }
  })

  const handleEmailSubmit = emailForm.handleSubmit(async (data) => {
    setIsLoading(true)
    console.log('Enviar por correo:', data)

    const response = await quoteService.sendQuoteEmail(data.email, rxQuote.data)
    console.log('Respuesta del envío por correo:', response)

    if (response.success) {
      onConfirm()
    }
  })

  const handleWhatsAppSubmit = whatsappForm.handleSubmit((data) => {
    console.log('Enviar por WhatsApp:', data)
    onConfirm()
  })

  useEffect(() => {
    console.log('Cambio en cliente seleccionado:', rxQuote.selectedCustomer)

    emailForm.reset({ email: rxQuote.selectedCustomer?.email || '' })
    whatsappForm.reset({ phone: rxQuote.selectedCustomer?.phone || '' })
  }, [rxQuote.selectedCustomer, emailForm, whatsappForm])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='lg'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Enviar cotización</ModalHeader>
            <ModalBody>
              <p>Asegúrate de que toda la información sea correcta antes de proceder. Una vez enviada, no podrás editarla ni eliminarla.</p>

              {!rxQuote.selectedCustomer ? (
                <Alert
                  classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
                  hideIconWrapper
                  color='warning'
                  icon={<TriangleAlert />}
                  title='Advertencia'
                  description='Esta cotizacion no tiene un cliente seleccionado. '
                />
              ) : (
                <div>
                  <p>
                    <strong>Cliente:</strong> {rxQuote.selectedCustomer?.name || 'No seleccionado'}
                  </p>
                  <p>
                    <strong>Email:</strong> {rxQuote.selectedCustomer?.email || 'No seleccionado'}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {rxQuote.selectedCustomer?.phone || 'No seleccionado'}
                  </p>
                </div>
              )}

              <p>¿Cómo quieres enviar la cotización?</p>

              <RadioGroup
                value={sendType}
                onValueChange={(value) => {
                  setSendType(value as 'email' | 'whatsapp')
                }}
                className='flex flex-col gap-2'
              >
                <Radio value='email'>Correo electrónico</Radio>
                <Radio value='whatsapp'>Whatsapp</Radio>
              </RadioGroup>

              {sendType === 'email' && (
                <form id='emailForm' onSubmit={handleEmailSubmit} className={rxQuote.selectedCustomer ? 'hidden' : ''}>
                  <Input
                    isInvalid={!!emailForm.formState.errors.email}
                    errorMessage={emailForm.formState.errors.email?.message}
                    {...emailForm.register('email')}
                    label='Correo electrónico'
                    autoFocus
                  />
                </form>
              )}

              {sendType === 'whatsapp' && (
                <form id='whatsappForm' onSubmit={handleWhatsAppSubmit} className={rxQuote.selectedCustomer ? 'hidden' : ''}>
                  <Input
                    isInvalid={!!whatsappForm.formState.errors.phone}
                    errorMessage={whatsappForm.formState.errors.phone?.message}
                    {...whatsappForm.register('phone')}
                    type='tel'
                    inputMode='numeric'
                    autoComplete='tel'
                    label='Teléfono'
                    maxLength={10}
                    autoFocus
                  />
                </form>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant='light' color='danger' onPress={onClose}>
                Cancelar
              </Button>
              <Button color='primary' type='submit' form={sendType === 'email' ? 'emailForm' : 'whatsappForm'} isLoading={isLoading}>
                Aceptar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalSendQuote
