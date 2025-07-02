import { Autocomplete, AutocompleteItem, Input, Select, SelectItem, Switch, Textarea } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CustomerFormData, customerSchema } from '../../schemas/customer.shema'
import { customerService } from '../../services/customerService'
import { RootState } from '../../store'
import { setSelectedCustomer } from '../../store/slices/customersSlice'
import { Customer, estadosMexico } from '../../types'

type AddCustomerProps = {
  onSuccess: (customer: Customer | null) => void
}

const AddCustomer = ({ onSuccess }: AddCustomerProps) => {
  const [invoiceData, setInvoiceData] = useState(false)
  const customer = useSelector((state: RootState) => state.clientes.selectedCustomer)
  const dispatch = useDispatch()

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    mode: 'onSubmit',
    defaultValues: {
      id: customer?.id ? Number(customer.id) : undefined,
      customer_type: 'individual',
      name: customer?.name || '',
      rfc: customer?.rfc || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      address: customer?.address || '',
      state: customer?.state || '',
      city: customer?.city || '',
      postalcode: customer?.postalcode || '',
      notes: customer?.notes || ''
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = form

  const handleSave = handleSubmit(
    async (data) => {
      // Si el cliente ya existe, actualizamos sus datos, de lo contrario, lo agregamos como nuevo
      if (!customer) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...newData } = data
        const newCustomer = await customerService.addCustomer(newData)
        onSuccess(newCustomer)
      } else {
        const updatedCustomer = await customerService.updateCustomer(data)
        if (updatedCustomer) {
          dispatch(setSelectedCustomer(updatedCustomer))
          onSuccess(updatedCustomer)
        }
      }
    },
    (errors) => {
      console.warn('❌ Errores de validación:', errors)
    }
  )

  useEffect(() => {
    // Si el cliente tiene datos de facturación, mostramos los campos adicionales
    if (customer && (customer.rfc || customer.postalcode || customer.address || customer.state || customer.city)) {
      setInvoiceData(true)
    }
  }, [customer])
  return (
    <form id='add-customer-form' onSubmit={handleSave} className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <Input size='sm' label='ID del cliente' value={customer?.id ? String(customer.id) : ''} readOnly {...register('id')} isDisabled />

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
