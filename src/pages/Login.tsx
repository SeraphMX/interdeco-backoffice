import { Alert, Button, Card, CardBody, Checkbox, Input, Tab, Tabs } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { loginUserForm, LoginUserForm } from '../schemas/user.schema'
import { AppDispatch, RootState } from '../store'
import { loginUser } from '../store/slices/authSlice'

const Login = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { authError, isLoading, user } = useSelector((state: RootState) => state.auth)
  const [selectedUser, setSelectedUser] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginUserForm),
    mode: 'onSubmit'
  })

  const handleUserSelect = (key: string) => {
    setSelectedUser(key)
  }

  const handleSignIn = handleSubmit(
    (data: LoginUserForm) => {
      console.log('Iniciando sesión con:', data)
      //if (!userCanLogin) return
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      dispatch(loginUser({ email: data.email, password: data.password }))
    },
    (errors) => {
      console.error('Error al iniciar sesión:', errors)
    }
  )

  useEffect(() => {
    setSelectedUser('admin')
  }, [])

  useEffect(() => {
    console.log('resetting form for selectedUser:', selectedUser)
    if (selectedUser === 'admin') {
      reset({
        email: 'admin@interdeco.mx',
        password: 'iDeco#13122@'
      })
    } else {
      reset({
        email: 'staff@interdeco.mx',
        password: 'D1R8XYfWwN'
      })
    }
  }, [selectedUser, reset])

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
            <p className=' text-gray-600 text-center'>Inicia sesión para continuar</p>
          )}

          <Tabs
            selectedKey={selectedUser}
            onSelectionChange={(key) => handleUserSelect(key as string)}
            variant='bordered'
            fullWidth
            color='primary'
          >
            {/* <Tab key="none" title="Manual" /> */}
            <Tab key='admin' title='Admin Demo' />
            <Tab key='staff' title='Staff Demo' />
          </Tabs>

          <form onSubmit={handleSignIn} className='space-y-4'>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <Input type='email' label='Correo electrónico' {...field} isInvalid={!!errors.email} errorMessage={errors.email?.message} />
              )}
            />

            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <Input
                  label='Contraseña'
                  type={showPassword ? 'text' : 'password'}
                  {...field}
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
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
              )}
            />

            <div className='flex items-center justify-between'>
              <Checkbox
                isSelected={rememberMe}
                onValueChange={setRememberMe}
                //isDisabled={isLoading || !userCanLogin}
              >
                <span className='text-sm'>Recordarme</span>
              </Checkbox>
              <div className='text-sm'>
                <Link to='/cuenta/reset-password' className='font-medium text-blue-600 hover:text-blue-500'>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
            <Button type='submit' color='primary' className='w-full'>
              Iniciar sesión
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

export default Login
