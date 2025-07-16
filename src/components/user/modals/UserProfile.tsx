import { addToast, Button, Input, Modal, ModalBody, ModalContent, ModalHeader, NumberInput, Switch, Tab, Tabs } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { profileResetPasswordSchema, profileUserSchema } from '../../../schemas/user.schema'
import { userService } from '../../../services/userService'
import { RootState } from '../../../store'
import { updateUser } from '../../../store/slices/authSlice'

interface ModalPaymentProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const UserProfile = ({ isOpen, onOpenChange }: ModalPaymentProps) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState(user?.email_notifications || false)
  const [quotesExpire, setQuotesExpire] = useState(user?.quotes_expire || 10)

  const {
    register: formData,
    handleSubmit: submitFormData,
    formState: { errors: formDataErrors }
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(profileUserSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  })

  const {
    register: formPassword,
    handleSubmit: submitFormPassword,
    formState: { errors: formPasswordErrors },
    reset: resetFormPassword,
    setError: setFormPasswordError
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(profileResetPasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password2: ''
    }
  })

  const handleUpdateProfileData = submitFormData(
    async (data) => {
      if (!data) return
      setLoading(true)

      await userService.updateUser({
        ...user,
        full_name: data.full_name,
        phone: data.phone,
        email: user?.email || '',
        role: user?.role || 'staff'
      })

      addToast({
        title: 'Perfil actualizado',
        description: 'Los datos de tu perfil han sido actualizados correctamente.',
        color: 'primary'
      })

      setLoading(false)
    },
    async (errors) => {
      console.error('Errores de validación:', errors)
      setLoading(false)
    }
  )

  const handleUpdatePassword = submitFormPassword(async (data) => {
    const { current_password, new_password } = data
    setLoading(true)

    if (user) {
      const newPasswordSet = await userService.passwordChange(current_password, new_password)
      if (!newPasswordSet) {
        setFormPasswordError('current_password', {
          type: 'manual',
          message: 'La contraseña actual es incorrecta. '
        })
        setLoading(false)

        return
      }
      console.log('Contraseña actualizada exitosamente')
      setShowPassword(false)
    }

    setLoading(false)
  })

  const handleUpdateSettings = async () => {
    setLoading(true)
    if (user) {
      await userService.updateSettings(user, {
        email_notifications: emailNotifications,
        quotes_expire: quotesExpire
      })

      dispatch(
        updateUser({
          ...user,
          email_notifications: emailNotifications,
          quotes_expire: quotesExpire
        })
      )
    } else {
      console.error('User is null. Cannot update settings.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      // Aquí puedes cargar los datos del usuario si es necesario
      console.log('Modal de perfil abierto')
      resetFormPassword({ current_password: '', new_password: '', new_password2: '' })
    }
  }, [isOpen, resetFormPassword])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Perfil</ModalHeader>
            <ModalBody>
              <Tabs aria-label='Options' disableAnimation fullWidth variant='underlined'>
                <Tab key='photos' title='Datos de la cuenta'>
                  <form className='space-y-4' onSubmit={handleUpdateProfileData}>
                    <Input
                      label='Correo electrónico'
                      type='email'
                      {...formData('email')}
                      isInvalid={!!formDataErrors.email}
                      errorMessage={formDataErrors.email?.message}
                      readOnly
                    />
                    <Input
                      label='Nombre completo'
                      {...formData('full_name')}
                      isInvalid={!!formDataErrors.full_name}
                      errorMessage={formDataErrors.full_name?.message}
                      isClearable
                    />
                    <Input
                      label='Teléfono'
                      type='tel'
                      maxLength={10}
                      {...formData('phone')}
                      isInvalid={!!formDataErrors.phone}
                      errorMessage={formDataErrors.phone?.message}
                      isClearable
                    />
                    <footer className='flex justify-between gap-2 mt-4'>
                      <Button color='primary' variant='light' onPress={onClose}>
                        Cerrar
                      </Button>
                      <Button color='primary' type='submit' isLoading={loading} disabled={loading}>
                        Guardar cambios
                      </Button>
                    </footer>
                  </form>
                </Tab>
                <Tab key='seguridad' title='Seguridad'>
                  <form className='flex flex-col gap-4' onSubmit={handleUpdatePassword}>
                    <Input
                      label='Correo electrónico'
                      type='email'
                      {...formData('email')}
                      isInvalid={!!formDataErrors.email}
                      errorMessage={formDataErrors.email?.message}
                      readOnly
                      className='hidden'
                    />
                    <Input
                      label='Contraseña Actual'
                      type={showPassword ? 'text' : 'password'}
                      {...formPassword('current_password')}
                      isInvalid={!!formPasswordErrors.current_password}
                      errorMessage={formPasswordErrors.current_password?.message}
                      endContent={
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute inset-y-0 right-0 pr-3 flex items-center'
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className='h-5 w-5 text-gray-400' /> : <Eye className='h-5 w-5 text-gray-400' />}
                        </button>
                      }
                    />
                    <Input
                      label='Nueva contraseña'
                      type={showPassword ? 'text' : 'password'}
                      {...formPassword('new_password')}
                      isInvalid={!!formPasswordErrors.new_password}
                      errorMessage={formPasswordErrors.new_password?.message}
                    />
                    <Input
                      label='Confirmar nueva contraseña'
                      type={showPassword ? 'text' : 'password'}
                      {...formPassword('new_password2')}
                      isInvalid={!!formPasswordErrors.new_password2}
                      errorMessage={formPasswordErrors.new_password2?.message}
                    />
                    <footer className='flex justify-between gap-2 mt-4'>
                      <Button color='primary' variant='light' onPress={onClose}>
                        Cerrar
                      </Button>
                      <Button color='primary' type='submit' isLoading={loading} disabled={loading}>
                        Guardar cambios
                      </Button>
                    </footer>
                  </form>
                </Tab>
                <Tab key='ajustes' title='Ajustes'>
                  <form className='space-y-4'>
                    <Switch defaultSelected={user?.email_notifications} onValueChange={(value) => setEmailNotifications(value)}>
                      Recibir notificaciones por correo electrónico
                    </Switch>

                    <section className='flex items-center justify-between gap-4'>
                      Mis cotizaciones expiran en:
                      <NumberInput
                        size='sm'
                        className='w-28'
                        minValue={1}
                        maxValue={30}
                        formatOptions={{
                          style: 'unit',
                          unit: 'day',
                          unitDisplay: 'long'
                        }}
                        defaultValue={user?.quotes_expire || 10}
                        onValueChange={(value) => setQuotesExpire(value)}
                      />
                    </section>

                    <footer className='flex justify-between gap-2 mt-4'>
                      <Button color='primary' variant='light' onPress={onClose}>
                        Cerrar
                      </Button>
                      <Button color='primary' onPress={handleUpdateSettings} isLoading={loading} disabled={loading}>
                        Guardar cambios
                      </Button>
                    </footer>
                  </form>
                </Tab>
              </Tabs>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default UserProfile
