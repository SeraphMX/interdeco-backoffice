import { Button, Card, CardBody, Input, Tab, Tabs } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store'
import { clearError, login } from '../store/slices/authSlice'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentUser, error } = useSelector((state: RootState) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedUser, setSelectedUser] = useState('')

  useEffect(() => {
    if (currentUser) {
      navigate('/')
    }
  }, [currentUser, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  const handleUserSelect = (key: string) => {
    setSelectedUser(key)
    if (key === 'admin') {
      setEmail('admin@interdeco.mx')
      setPassword('iDeco#13122@')
    } else if (key === 'staff') {
      setEmail('staff@interdeco.mx')
      setPassword('staff123')
    } else {
      setEmail('')
      setPassword('')
    }
    if (error) dispatch(clearError())
  }

  useEffect(() => {
    setSelectedUser('admin')
    setEmail('admin@interdeco.mx')
    setPassword('iDeco#13122@')
  }, [])

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardBody className='space-y-6 p-8'>
          <div className='text-center'>
            <img src='/branding/logo-full.svg' className='max-w-36 mx-auto' alt='' />
            <p className='mt-2 text-gray-600'>Inicia sesión para continuar</p>
          </div>

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

          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              type='email'
              label='Correo electrónico'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setSelectedUser('none')
                if (error) dispatch(clearError())
              }}
              isInvalid={!!error}
            />
            <Input
              type='password'
              label='Contraseña'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setSelectedUser('none')
                if (error) dispatch(clearError())
              }}
              isInvalid={!!error}
              errorMessage={error}
            />
            <Button type='submit' color='primary' className='w-full'>
              Iniciar sesión
            </Button>
          </form>

          {selectedUser === 'none' && (
            <div className='mt-4 text-sm text-gray-600'>
              <p>Usuarios de prueba:</p>
              <ul className='mt-2 space-y-1'>
                <li>Admin: admin@example.com / admin123</li>
                <li>Staff: staff@example.com / staff123</li>
              </ul>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default Login
