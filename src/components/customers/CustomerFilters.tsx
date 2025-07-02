import { Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Tooltip } from '@heroui/react'
import { Search, X } from 'lucide-react'
import { customerStatus } from '../../types'

type FilterState<T> = {
  value: T
  setValue: (value: T) => void
}

interface CustomerFiltersProps {
  filters?: {
    search?: FilterState<string>
    status?: FilterState<string[]>
  }
}

const CustomerFilters = ({ filters }: CustomerFiltersProps) => {
  const search = filters?.search
  const status = filters?.status

  const clearFilters = () => {
    if (search?.setValue) {
      search.setValue('')
    }

    if (status?.setValue) {
      status.setValue([])
    }
  }
  return (
    <section className='flex flex-wrap flex-grow gap-4 '>
      <Input
        type='text'
        placeholder='Buscar clientes...'
        className='w-full sm:max-w-[300px]'
        value={search?.value || ''}
        onClear={() => search?.setValue && search.setValue('')}
        onValueChange={search?.setValue}
        startContent={<Search className='text-gray-400' size={20} />}
        isClearable
      />

      <Dropdown>
        <DropdownTrigger>
          <Button variant='flat'>
            {(status?.value?.length ?? 0) > 1 ? (
              <>
                Status
                <Chip size='sm' color='primary' radius='full' className='w-5 h-5'>
                  {status?.value?.length ?? 0}
                </Chip>
              </>
            ) : status?.value?.length === 1 ? (
              <span className='capitalize'>{customerStatus.find((s) => s.key === status.value[0])?.label}</span>
            ) : (
              'Filtrar por estado'
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label='Filtrar por status'
          closeOnSelect={false}
          selectedKeys={new Set(status?.value)}
          selectionMode='multiple'
          onSelectionChange={(keys) => status?.setValue(Array.from(keys).map((key) => key.toString()))}
        >
          {customerStatus.map((status) => (
            <DropdownItem key={status.key}>{status.label}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      {(status?.value?.length ?? 0) > 0 ? (
        <Tooltip content='Limpiar filtros'>
          <Button variant='light' color='danger' onPress={clearFilters} isIconOnly>
            <X size={20} />
          </Button>
        </Tooltip>
      ) : null}
    </section>
  )
}

export default CustomerFilters
