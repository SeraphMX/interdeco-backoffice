import { Chip, ModalBody, ModalHeader, Tab, Tabs } from '@heroui/react'
import { Building2, SquareUserRound } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { customerStatus } from '../../types'
import CustomerHistory from './CustomerHistory'

interface CustomerDetailsProps {
  idCustomer: number
}
const CustomerDetails = ({ idCustomer }: CustomerDetailsProps) => {
  const customers = useSelector((state: RootState) => state.clientes.items)
  return (
    <section>
      {customers
        .filter((customer) => customer.id === idCustomer)
        .map((customer) => (
          <>
            <ModalHeader className='flex items-center gap-1 '>
              {customer.customer_type === 'individual' ? (
                <SquareUserRound className='text-gray-500' size={24} />
              ) : (
                <Building2 className='text-gray-500' size={24} />
              )}
              <h3 className='text-xl font-semibold  truncate whitespace-nowrap overflow-hidden'>{customer.name}</h3>
            </ModalHeader>
            <ModalBody key={customer.id}>
              <Tabs aria-label='Options' disableAnimation>
                <Tab key='data' title='Datos del cliente'>
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
                </Tab>
                <Tab key='history' title='Historial'>
                  <CustomerHistory idCustomer={customer.id} />
                </Tab>
                {/* <Tab key='insights' title='Informacíon'></Tab> */}
              </Tabs>

              <section></section>
            </ModalBody>
          </>
        ))}
    </section>
  )
}

export default CustomerDetails
