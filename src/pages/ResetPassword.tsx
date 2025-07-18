import { Button, Card, CardBody, Input } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { LoginUserForm, resetPasswordMail, User } from '../schemas/user.schema'
import { userService } from '../services/userService'
import { AppDispatch, RootState } from '../store'
import { loginUser } from '../store/slices/authSlice'

const ResetPassword = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, user } = useSelector((state: RootState) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const params = useParams<{ token: string }>()
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [resetUser, setResetUser] = useState<User | null>(null)

  const {
    register: formPassword,
    handleSubmit,
    formState: { errors: formPasswordErrors },
    control,
    reset
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
    async (data: LoginUserForm) => {
      if (!resetUser) return
      await userService.passwordResetMail(resetUser, data.password)

      dispatch(loginUser({ email: data.email, password: data.password }))
    },
    (errors) => {
      console.error('Errores de validación:', errors)
    }
  )

  const handleBack = () => {
    navigate('/cuenta/recover-password')
  }

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user && user.id && !isLoading) {
      navigate('/')
    }
  }, [user, isLoading, navigate])

  useEffect(() => {
    const verifyToken = async () => {
      if (params.token) {
        const tokenData = await userService.verifyResetPasswordToken(params.token)

        if (tokenData.error) {
          setTokenError(tokenData.error)
          return
        }

        reset({
          email: tokenData.verifiedUser?.email || ''
        })
        setResetUser({
          id: tokenData.verifiedUser?.id || '',
          email: tokenData.verifiedUser?.email || '',
          full_name: tokenData.verifiedUser?.full_name || '',
          role: tokenData.verifiedUser?.role ?? 'staff'
        })
      }
    }

    verifyToken()
  }, [params.token, reset])

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
            {tokenError ? (
              <section>
                <div className='text-red-600'>{tokenError}</div>
                <Button fullWidth onPress={handleBack} className='mt-4' color='primary'>
                  Solicitar nuevo enlace
                </Button>
              </section>
            ) : (
              <section>
                <p className=' text-gray-600 '>
                  Bienvenido <strong>{resetUser?.full_name}</strong> hemos verificado tu identidad, ahora puedes restablecer tu contraseña.
                </p>
                <form onSubmit={handleResetPassword} className='space-y-4'>
                  <Controller
                    name='email'
                    control={control}
                    render={({ field }) => (
                      <Input
                        className='hidden'
                        label='Correo electrónico'
                        {...field}
                        isInvalid={!!formPasswordErrors.email}
                        errorMessage={formPasswordErrors.email?.message}
                      />
                    )}
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
              </section>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}

export default ResetPassword
