import { Alert, Button, Card, CardBody, Input } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { recoverPassowordSchema } from '../schemas/user.schema'
import { userService } from '../services/userService'
import { RootState } from '../store'

const RecoverPassword = () => {
  const navigate = useNavigate()
  const { authError, isLoading, user } = useSelector((state: RootState) => state.auth)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eMailSent, setEmailSent] = useState(false)

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(recoverPassowordSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: ''
    }
  })

  const handleResetPassword = handleSubmit(
    async (data) => {
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

      await userService.sendEmail(data.email, 'password-reset')

      setIsSubmitting(false)
      setEmailSent(true)

      setTimeout(() => {
        navigate('/login')
      }, 30000)
    },
    (errors) => {
      console.error('Errores de validación:', errors)
    }
  )

  const handleBack = () => {
    navigate('/login', { viewTransition: true })
  }

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user && user.id && !isLoading) {
      navigate('/')
    }
  }, [user, isLoading, navigate])

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 15 }}
      >
        <Card className='w-full max-w-md'>
          <CardBody className='space-y-6 p-8'>
            <img src='/branding/logo-full.svg' className='max-w-36 mx-auto' alt='' />
            {eMailSent ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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
                  <footer className='flex gap-4'>
                    <Button variant='light' color='primary' className='w-full' onPress={handleBack}>
                      Cancelar
                    </Button>
                    <Button
                      type='submit'
                      color='primary'
                      className='w-full'
                      isLoading={isSubmitting || isLoading}
                      disabled={isSubmitting || isLoading}
                    >
                      Recuperar contraseña
                    </Button>
                  </footer>
                </form>
              </section>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}

export default RecoverPassword
