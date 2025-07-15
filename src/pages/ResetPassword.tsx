import { Alert, Button, Card, CardBody, Input } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LoginUserForm, resetPasswordMail } from '../schemas/user.schema'
import { AppDispatch, RootState } from '../store'

const ResetPassword = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { authError, isLoading, user } = useSelector((state: RootState) => state.auth)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register: formPassword,
    handleSubmit,
    formState: { errors: formPasswordErrors }
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(resetPasswordMail),
    defaultValues: {
      email: '',
      password: '',
      password2: ''
    }
  })

  const handleResetPassword = handleSubmit(
    (data: LoginUserForm) => {
      console.log('Restableciendo contraseña para:', data)
      // Aquí iría la lógica para enviar el formulario de restablecimiento de contraseña

      //await userService.passwordReset()

      console.log('Iniciando sesión con:', data)
      //dispatch(loginUser({ email: data.email, password: data.password }))
    },
    (errors) => {
      console.error('Errores de validación:', errors)
    }
  )

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user && user.id && !isLoading) {
      navigate('/')
    }
  }, [user, isLoading, navigate])

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardBody className='space-y-6 p-8'>
          <img src='/branding/logo-full.svg' className='max-w-36 mx-auto' alt='' />

          {authError ? (
            <Alert
              classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
              hideIconWrapper
              color='danger'
              icon={<TriangleAlert />}
              title={authError.type === 'user_banned_live' ? 'Cuenta desactivada' : 'Error al iniciar sesión'}
              description={authError.message}
            />
          ) : (
            <p className=' text-gray-600 text-center'>Restablece tu contraseña</p>
          )}

          <form onSubmit={handleResetPassword} className='space-y-4'>
            <Input
              label='Correo electrónico'
              {...formPassword('email')}
              isInvalid={!!formPasswordErrors.email}
              errorMessage={formPasswordErrors.email?.message}
            />

            <Input
              label='Nueva contraseña'
              type={showPassword ? 'text' : 'password'}
              {...formPassword('password')}
              isInvalid={!!formPasswordErrors.password}
              errorMessage={formPasswordErrors.password?.message}
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
              label='Confirmar nueva contraseña'
              type={showPassword ? 'text' : 'password'}
              {...formPassword('password2')}
              isInvalid={!!formPasswordErrors.password2}
              errorMessage={formPasswordErrors.password2?.message}
            />

            <Button type='submit' color='primary' className='w-full'>
              Restablecer contraseña
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

export default ResetPassword
