import { Chip } from '@heroui/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { customerStatus } from '../../types'

const CustomerDetails = () => {
  const customer = useSelector((state: RootState) => state.clientes.selectedCustomer)

  if (!customer) {
    return <div className='text-gray-500'>Seleccione un cliente para ver los detalles.</div>
  }

  return (
    <>
      <section>
        <div className='flex items-center gap-2 flex-grow min-w-0'></div>
        <div className='flex flex-col gap-2 mt-4  text-gray-600'>
          <div>
            <strong>Status:</strong>{' '}
            <Chip className={`${customerStatus.find((status) => status.key === customer.status)?.color}`}>
              {customerStatus.find((status) => status.key === customer.status)?.label || 'Desconocido'}
            </Chip>
          </div>
          <div>
            <strong>Email:</strong> {customer.email}
          </div>
          <div>
            <strong>Teléfono:</strong> {customer.phone}
          </div>
          {customer.notes && (
            <div>
              <strong>Notas:</strong> {customer.notes}
            </div>
          )}
        </div>
      </section>

      <section className='grid sm:grid-cols-2 gap-2 mt-4 text-gray-600'>
        {customer.rfc && (
          <div>
            <strong>RFC:</strong> {customer.rfc}
          </div>
        )}
        {customer.postalcode && (
          <div>
            <strong>CP:</strong> {customer.postalcode}
          </div>
        )}
        {customer.address && (
          <div className='col-span-2'>
            <strong>Dirección:</strong> {customer.address}
          </div>
        )}
        {customer.state && (
          <div>
            <strong>Estado:</strong> {customer.state}
          </div>
        )}
        {customer.city && (
          <div>
            <strong>Ciudad:</strong> {customer.city}
          </div>
        )}
      </section>
    </>
  )
}

export default CustomerDetails
