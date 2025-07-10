import { addToast, Input, Select, SelectItem } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import generator from 'generate-password-ts'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { createUserSchema, User } from '../../schemas/user.schema'
import { userService } from '../../services/userService'
import { RootState } from '../../store'

type AddCustomerProps = {
  onSuccess: () => void
}

const AddUser = ({ onSuccess }: AddCustomerProps) => {
  const selectedUser = useSelector((state: RootState) => state.users.selectedUser)
  const [showPassword, setShowPassword] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  const password = generator.generate({
    length: 10,
    numbers: true,
    uppercase: true,
    lowercase: true,
    strict: true
  })

  const form = useForm({
    resolver: zodResolver(createUserSchema),
    mode: 'onSubmit',
    defaultValues: {
      id: selectedUser?.id || selectedUser?.id,
      role: selectedUser?.role || 'staff',
      full_name: selectedUser?.full_name || 'Prueba',
      phone: selectedUser?.phone || '1234567890',
      email: selectedUser?.email || 'staff@interdeco.mx',
      password: password
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = form

  const handleSave = handleSubmit(
    async (data: User) => {
      //Si el usuario ya existe, actualizamos sus datos, de lo contrario, lo agregamos como nuevo
      if (!selectedUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...newData } = data
        await userService.createUser(newData)
        onSuccess()
      } else {
        await userService.updateUser(data)
        onSuccess()
      }
    },
    (errors) => {
      console.warn('❌ Errores de validación:', errors)
    }
  )

  const handleCopyPassword = () => {
    setCopiedPassword(true)
    navigator.clipboard.writeText(form.getValues('password') || '')
    addToast({
      title: 'Contraseña copiada',
      description: 'La contraseña ha sido copiada al portapapeles.',
      color: 'primary'
    })

    setTimeout(() => {
      setCopiedPassword(false)
    }, 2000)
  }

  return (
    <form id='add-customer-form' onSubmit={handleSave} className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <Input
        size='sm'
        label='ID de usuario'
        value={selectedUser?.id ? String(selectedUser.id) : ''}
        readOnly
        {...register('id')}
        isDisabled
        className='hidden'
      />

      <Select className='max-w-xs' label='Tipo de usuario' size='sm' isInvalid={!!errors.role} {...register('role')} disallowEmptySelection>
        <SelectItem key='admin'>Administrador</SelectItem>
        <SelectItem key='staff'>Staff</SelectItem>
      </Select>

      <Input
        size='sm'
        label='Correo electrónico'
        {...register('email')}
        isInvalid={!!errors.email}
        isClearable
        errorMessage={errors.email?.message}
      />

      <Input size='sm' label='Nombre' {...register('full_name')} isInvalid={!!errors.full_name} isClearable />

      <Input
        size='sm'
        label='Télefono'
        {...register('phone')}
        isInvalid={!!errors.phone}
        isClearable
        maxLength={10}
        errorMessage={errors.phone?.message}
      />
      <Input
        label='Contraseña'
        type={showPassword ? 'text' : 'password'}
        size='sm'
        className={selectedUser ? 'hidden' : ''}
        {...register('password')}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message}
        maxLength={20}
        endContent={
          <div className='absolute inset-y-0 right-0 flex items-center '>
            <button type='button' onClick={() => setShowPassword(!showPassword)} className=' pr-3 flex items-center' tabIndex={-1}>
              {showPassword ? <EyeOff className='h-5 w-5 text-gray-400' /> : <Eye className='h-5 w-5 text-gray-400' />}
            </button>
            <button type='button' onClick={() => handleCopyPassword()} className=' pr-3 flex items-center' tabIndex={-1}>
              {copiedPassword ? <Check className='h-5 w-5 text-gray-400' /> : <Copy className='h-5 w-5 text-gray-400' />}
            </button>
          </div>
        }
      />
    </form>
  )
}

export default AddUser
