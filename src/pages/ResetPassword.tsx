import { Alert, Button, Card, CardBody, Input } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { resetPasswordMail } from '../schemas/user.schema'
import { AppDispatch, RootState } from '../store'

const ResetPassword = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { authError, isLoading, user } = useSelector((state: RootState) => state.auth)
  const [selectedUser, setSelectedUser] = useState('')

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordMail),
    mode: 'onSubmit'
  })

  const handleResetPassword = handleSubmit(
    (data) => {
      console.log('Iniciando sesión con:', data)
    },
    (errors) => {
      console.error('Error al iniciar sesión:', errors)
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
            <div>
              <p className='text-gray-600 '>
                Si has olvidado tu contraseña, ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
              </p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className='space-y-4'>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <Input type='email' label='Correo electrónico' {...field} isInvalid={!!errors.email} errorMessage={errors.email?.message} />
              )}
            />

            <Button type='submit' color='primary' className='w-full'>
              Recuperar contraseña
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

export default ResetPassword
