import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input } from '@heroui/react'
import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface ProductsFiltersProps {
  filterValue?: string
  setFilterValue?: (value: string) => void
}

const ProductsFilters = ({ filterValue, setFilterValue }: ProductsFiltersProps) => {
  //const [filterValue, setFilterValue] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Selection>(new Set([]))
  const [selectedProviders, setSelectedProviders] = useState<Selection>(new Set([]))
  const rxCategories = useSelector((state: RootState) => state.catalog.categorias)

  const rxProviders = [
    { key: 1, name: 'Teknostep' },
    { key: 2, name: 'Shades' },
    { key: 3, name: 'Vertilux' }
  ]

  const clearFilters = () => {
    if (setFilterValue) {
      setFilterValue('')
    }
    setSelectedCategories(new Set([]))
    setSelectedProviders(new Set([]))
    //setPriceRange({ min: '', max: '' })
  }

  return (
    <section className='flex flex-wrap flex-grow gap-4 '>
      <Input
        isClearable
        className='w-full sm:max-w-[300px]'
        placeholder='Buscar en catálogo...'
        startContent={<Search className='text-gray-400' size={20} />}
        value={filterValue}
        onClear={() => setFilterValue && setFilterValue('')}
        onValueChange={setFilterValue}
        autoFocus
        onFocus={(e) => e.target.select()}
      />

      <Dropdown>
        <DropdownTrigger>
          <Button variant='flat' className='capitalize'>
            Categorías ({selectedCategories.size})
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label='Filtrar por categorías'
          closeOnSelect={false}
          //   selectedKeys={selectedCategories}
          //   selectionMode='multiple'
          //   onSelectionChange={setSelectedCategories}
        >
          {rxCategories.map((category) => (
            <DropdownItem key={category.id}>{category.description}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      <Dropdown>
        <DropdownTrigger>
          <Button variant='flat' className='capitalize'>
            Proveedores ({selectedProviders.size})
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label='Filtrar por proveedores'
          closeOnSelect={false}
          //   selectedKeys={selectedProviders}
          //   selectionMode='multiple'
          //   onSelectionChange={setSelectedProviders}
        >
          {rxProviders.map((provider) => (
            <DropdownItem key={provider.key}>{provider.name}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      {/* <div className='flex gap-2 items-center'>
              <Input
                type='number'
                placeholder='Precio min'
                className='w-28'
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              />
              <span>-</span>
              <Input
                type='number'
                placeholder='Precio max'
                className='w-28'
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              />
            </div> */}

      {/* <Slider
              className='max-w-20'
              defaultValue={[100, 500]}
              formatOptions={{ style: 'currency', currency: 'USD' }}
              label='Price Range'
              maxValue={1000}
              minValue={0}
              step={50}
            /> */}

      {selectedCategories.size > 0 || selectedProviders.size > 0 ? (
        //|| priceRange.min
        //|| priceRange.max
        <Button variant='light' color='danger' onPress={clearFilters}>
          <X size={20} />
          Limpiar filtros
        </Button>
      ) : null}
    </section>
  )
}

export default ProductsFilters
