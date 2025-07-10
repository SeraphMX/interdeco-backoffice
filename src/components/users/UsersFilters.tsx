import { Input } from '@heroui/react'
import { Search } from 'lucide-react'

type FilterState<T> = {
  value: T
  setValue: (value: T) => void
}

interface QuotesFiltersProps {
  filters?: {
    search?: FilterState<string>
    status?: FilterState<string[]>
  }
}

const UsersFilters = ({ filters }: QuotesFiltersProps) => {
  //const rxCategories = useSelector((state: RootState) => state.catalog.categorias)

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
        isClearable
        className='w-full sm:max-w-[300px]'
        placeholder='Buscar por cliente...'
        startContent={<Search className='text-gray-400' size={20} />}
        value={search?.value || ''}
        onClear={() => search?.setValue && search.setValue('')}
        onValueChange={search?.setValue}
        autoFocus
        onFocus={(e) => e.target.select()}
      />

      {/* <Dropdown>
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
              <span className='capitalize'>{quoteStatus.find((s) => s.key === status.value[0])?.label}</span>
            ) : (
              'Filtrar por estado'
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label='Filtrar por proveedores'
          closeOnSelect={false}
          selectionMode='multiple'
          selectedKeys={new Set(status?.value)}
          onSelectionChange={(keys) => status?.setValue(Array.from(keys).map((key) => key.toString()))}
        >
          {quoteStatus.map((status) => (
            <DropdownItem key={status.key}>
              <span className='capitalize'>{status.label}</span>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      {(status?.value?.length ?? 0) > 0 ? (
        <Tooltip content='Limpiar filtros'>
          <Button variant='light' color='danger' onPress={clearFilters} isIconOnly>
            <X size={20} />
          </Button>
        </Tooltip>
      ) : null} */}
    </section>
  )
}

export default UsersFilters
