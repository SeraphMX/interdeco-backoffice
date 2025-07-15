import { Alert, Button, Card, CardBody, Input } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { resetPasswordMail } from '../schemas/user.schema'
import { userService } from '../services/userService'
import { AppDispatch, RootState } from '../store'

const RecoverPassword = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { authError, isLoading, user } = useSelector((state: RootState) => state.auth)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eMailSent, setEmailSent] = useState(false)

  const {
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordMail),
    mode: 'onSubmit'
  })

  const handleResetPassword = handleSubmit(
    async (data) => {
      console.log('Recuperar contraseña de:', data)
      setIsSubmitting(true)

      const isRegistered = await userService.isEmailRegistered(data.email)

      if (!isRegistered) {
        setIsSubmitting(false)
        setError('email', {
          type: 'manual',
          message: 'El correo electrónico no está registrado'
        })
        return
      }

      setTimeout(() => {
        setIsSubmitting(false)
        setEmailSent(true)
        reset()
      }, 1000)

      setTimeout(() => {
        navigate('/login')
      }, 10000)
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

          {eMailSent ? (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <p className='text-gray-600 '>
                Hemos enviado un correo electrónico a tu bandeja de entrada, sigue las instrucciones para restablecer tu contraseña
              </p>
            </motion.div>
          ) : authError ? (
            <Alert
              classNames={{ alertIcon: 'fill-none', base: 'p-1' }}
              hideIconWrapper
              color='danger'
              icon={<TriangleAlert />}
              title={authError.type === 'user_banned_live' ? 'Cuenta desactivada' : 'Error al iniciar sesión'}
              description={authError.message}
            />
          ) : (
            <section className='space-y-4'>
              <p className='text-gray-600 '>
                Si has olvidado tu contraseña, ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
              </p>

              <form onSubmit={handleResetPassword} className='space-y-4'>
                <Controller
                  name='email'
                  control={control}
                  render={({ field }) => (
                    <Input
                      type='email'
                      label='Correo electrónico'
                      {...field}
                      isInvalid={!!errors.email}
                      errorMessage={errors.email?.message}
                    />
                  )}
                />

                <Button
                  type='submit'
                  color='primary'
                  className='w-full'
                  isLoading={isSubmitting || isLoading}
                  disabled={isSubmitting || isLoading}
                >
                  Recuperar contraseña
                </Button>
              </form>
            </section>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default RecoverPassword
