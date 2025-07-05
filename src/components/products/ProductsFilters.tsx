import { Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Tooltip } from '@heroui/react'
import { Search, X } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

type FilterState<T> = {
  value: T
  setValue: (value: T) => void
}

interface ProductsFiltersProps {
  filters?: {
    search?: FilterState<string>
    categories?: FilterState<string[]>
    providers?: FilterState<string[]>
    priceRange?: FilterState<{ min: string; max: string }>
  }
}

const ProductsFilters = ({ filters }: ProductsFiltersProps) => {
  const rxCategories = useSelector((state: RootState) => state.catalog.categories)
  const rxProviders = useSelector((state: RootState) => state.catalog.providers)
  const rxProducts = useSelector((state: RootState) => state.productos.items)

  const search = filters?.search
  const categories = filters?.categories
  const providers = filters?.providers

  const usedCategoryIds = new Set(rxProducts.map((product) => product.category))
  const filteredCategories = rxCategories.filter((category) => usedCategoryIds.has(category.id ?? -1))

  const usedProviderIds = new Set(rxProducts.map((product) => product.provider))
  const filteredProviders = rxProviders.filter((provider) => usedProviderIds.has(provider.id ?? -1))

  const clearFilters = () => {
    if (search?.setValue) {
      search.setValue('')
    }

    if (categories?.setValue) {
      categories.setValue([])
    }

    if (providers?.setValue) {
      providers.setValue([])
    }
  }

  return (
    <section className='flex flex-wrap flex-grow gap-4 '>
      <div className='flex-grow min-w-0 sm:max-w-[300px]'>
        <Input
          isClearable
          className='w-full '
          placeholder='Buscar en catálogo...'
          startContent={<Search className='text-gray-400' size={20} />}
          value={search?.value || ''}
          onClear={() => search?.setValue && search.setValue('')}
          onValueChange={search?.setValue}
          autoFocus
          onFocus={(e) => e.target.select()}
        />
      </div>
      <Dropdown>
        <DropdownTrigger>
          <Button variant='flat'>
            Categorías{' '}
            {categories?.value?.length ? (
              <Chip size='sm' color='secondary' radius='full' className=' w-5 h-5'>
                {categories.value.length}
              </Chip>
            ) : null}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label='Filtrar por categorías'
          closeOnSelect={false}
          selectionMode='multiple'
          selectedKeys={new Set(categories?.value)}
          onSelectionChange={(keys) => categories?.setValue(Array.from(keys).map((key) => key.toString()))}
        >
          {filteredCategories.map((category) => (
            <DropdownItem key={category.id?.toString() ?? ''}>{category.description}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      <Dropdown>
        <DropdownTrigger>
          <Button variant='flat'>
            Proveedores{' '}
            {providers?.value?.length ? (
              <Chip size='sm' color='primary' radius='full' className=' w-5 h-5'>
                {providers.value.length}
              </Chip>
            ) : null}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label='Filtrar por proveedores'
          closeOnSelect={false}
          selectionMode='multiple'
          selectedKeys={new Set(providers?.value)}
          onSelectionChange={(keys) => providers?.setValue(Array.from(keys).map((key) => key.toString()))}
        >
          {filteredProviders.map((provider) => (
            <DropdownItem key={provider.id?.toString() ?? ''}>{provider.name}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      {(categories?.value?.length ?? 0) > 0 || (providers?.value?.length ?? 0) > 0 ? (
        <Tooltip content='Limpiar filtros' placement='right'>
          <Button variant='light' color='danger' onPress={clearFilters} isIconOnly>
            <X size={20} />
          </Button>
        </Tooltip>
      ) : null}
    </section>
  )
}

export default ProductsFilters
