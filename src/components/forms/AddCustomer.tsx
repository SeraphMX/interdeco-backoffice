import { addToast, Autocomplete, AutocompleteItem, Input, Select, SelectItem, Switch, Textarea } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { customerSchema } from '../../schemas/customer.shema'
import { Customer, estadosMexico } from '../../types'

type AddCustomerProps = {
  onSuccess: (newCustomer: Customer) => void
}

const AddCustomer = ({ onSuccess }: AddCustomerProps) => {
  const [invoiceData, setInvoiceData] = useState(false)
  const form = useForm({
    resolver: zodResolver(customerSchema),
    mode: 'onSubmit',
    defaultValues: {
      customer_type: 'individual',
      name: '',
      rfc: '',
      phone: '',
      email: '',
      address: '',
      state: '',
      city: '',
      postalcode: '',
      notes: ''
    }
  })

  const {
    register,
    handleSubmit,
    //watch,
    formState: { errors }
  } = form

  const handleSave = handleSubmit(
    async (data) => {
      try {
        const { data: newCustomer, error } = await supabase.from('customers').insert([data]).select().single()
        if (error) throw error

        console.log('✅ Formulario válido:', data)

        addToast({
          title: 'Cliente agregado',
          description: 'Los datos del cliente se han guardado.',
          color: 'success'
        })
        onSuccess(newCustomer)
      } catch (error) {
        console.error('Error al agregar cliente:', error)
        addToast({
          title: 'Error al agregar cliente',
          description: 'Los datos no se pudieron guardar. Inténtalo de nuevo.',
          color: 'danger'
        })
      }
    },
    (errors) => {
      console.warn('❌ Errores de validación:', errors)
      // Aquí puedes mostrar alertas, toast, etc.
    }
  )

  return (
    <form id='add-customer-form' onSubmit={handleSave} className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <Select
        className='max-w-xs'
        label='Tipo de cliente'
        size='sm'
        isInvalid={!!errors.customer_type}
        {...register('customer_type')}
        disallowEmptySelection
      >
        <SelectItem key='individual'>Persona física</SelectItem>
        <SelectItem key='business'>Persona moral</SelectItem>
      </Select>

      <Input size='sm' label='Nombre del cliente' {...register('name')} isInvalid={!!errors.name} isClearable />

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
        size='sm'
        label='Correo electrónico'
        {...register('email')}
        isInvalid={!!errors.email}
        isClearable
        errorMessage={errors.email?.message}
      />

      <Textarea
        className='col-span-2'
        maxRows={2}
        label='Notas'
        placeholder='Escribe alguna nota o detalle adicional...'
        {...register('notes')}
        isInvalid={!!errors.notes}
        isClearable
      />

      <div className='col-span-2 flex items-center gap-2'>
        <Switch isSelected={invoiceData} onValueChange={setInvoiceData}>
          Datos adicionales
        </Switch>
      </div>

      {invoiceData && (
        <>
          <Input size='sm' label='RFC' maxLength={13} {...register('rfc')} isInvalid={!!errors.rfc} isClearable />
          <Input size='sm' label='Código postal' maxLength={5} {...register('postalcode')} isInvalid={!!errors.postalcode} isClearable />

          <Input size='sm' className='col-span-2' label='Dirección' {...register('address')} isInvalid={!!errors.address} isClearable />

          <Autocomplete className='max-w-xs' {...register('state')} defaultItems={estadosMexico} label='Estado' isClearable size='sm'>
            {(state) => <AutocompleteItem key={state.key}>{state.label}</AutocompleteItem>}
          </Autocomplete>

          <Input size='sm' label='Ciudad o municipio' {...register('city')} isInvalid={!!errors.city} isClearable />
        </>
      )}
    </form>
  )
}

export default AddCustomer
