import { Button, Spinner, Tooltip, useDisclosure } from '@heroui/react'
import { motion } from 'framer-motion'
import { ImportIcon, Plus, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import ProductEdit from '../components/forms/ProductEdit'
import ModalProductAdd from '../components/products/modals/ModalProductAdd'
import ModalProductsConfig from '../components/products/modals/ModalProductsConfig'
import ProductsFilters from '../components/products/ProductsFilters'
import ProductsTable from '../components/products/ProductsTable'
import { RootState } from '../store'
import { Product } from '../types'

const Catalogo = () => {
  const [filterValue, setFilterValue] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const prevProductRef = useRef<Product | null | undefined>(null)

  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [tableWrapperHeight, setwrapperHeight] = useState(60) // Altura inicial del wrapper de la tabla

  const { isOpen: isOpenProductAdd, onOpen: onOpenProductAdd, onOpenChange: onOpenChangeProductAdd } = useDisclosure()
  const { isOpen: isOpenConfig, onOpen: onOpenConfig, onOpenChange: onOpenChangeConfig } = useDisclosure()

  const selectedProduct = useSelector((state: RootState) => state.productos.selectedProduct)

  useEffect(() => {
    setLoading(false)
    const currentWrapper = tableWrapperRef.current

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setwrapperHeight(entry.contentRect.height)
        //console.log('Altura del div actualizada:', entry.contentRect.height)
      }
    })

    // Observar cambios en el div
    if (tableWrapperRef.current) {
      observer.observe(tableWrapperRef.current)
    }

    return () => {
      // Limpieza
      if (currentWrapper) {
        observer.unobserve(currentWrapper)
      }
    }
  }, [])

  useEffect(() => {
    // if (!selectedProduct) {
    // }

    if (selectedProduct) {
      //form.reset(selectedProduct)
    }

    const wasVisible = prevProductRef.current !== null
    const isVisible = selectedProduct !== null

    prevProductRef.current = selectedProduct

    if (isVisible !== wasVisible) {
      setwrapperHeight(0)

      // Fuerza una nueva medición después de que el DOM se actualice
      const timer = setTimeout(() => {
        if (wrapperRef.current && wrapperRef.current.offsetHeight > 0) {
          setwrapperHeight(wrapperRef.current.offsetHeight)
        }
      }, 50) // Pequeño delay para permitir el re-render

      return () => clearTimeout(timer)
    }
  }, [selectedProduct])

  return (
    <div className='flex flex-col gap-4 h-full pb-4'>
      <div className='flex justify-between items-center '>
        <ProductsFilters
          filters={{
            search: {
              value: filterValue,
              setValue: setFilterValue
            },
            categories: {
              value: selectedCategories,
              setValue: setSelectedCategories
            },
            providers: {
              value: selectedProviders,
              setValue: setSelectedProviders
            }
          }}
        />
        <section className='flex gap-2'>
          <Button color='primary' variant='ghost' onPress={onOpenProductAdd}>
            <Plus size={20} />
            Nuevo
          </Button>
          <ModalProductAdd isOpen={isOpenProductAdd} onOpenChange={onOpenChangeProductAdd} />
          <Button color='secondary' variant='ghost'>
            <ImportIcon size={20} />
            Importar
          </Button>

          <Tooltip content='Configuración' placement='bottom'>
            <Button isIconOnly variant='ghost' onPress={onOpenConfig}>
              <Settings size={20} />
            </Button>
          </Tooltip>
          <ModalProductsConfig isOpen={isOpenConfig} onOpenChange={onOpenChangeConfig} />
        </section>
      </div>

      <ProductEdit />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut', delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
        ref={tableWrapperRef}
        className='flex flex-col flex-1 shadow-small rounded-lg '
      >
        {loading ? (
          <div className='bg-white/20 backdrop-blur-md w-full h-full flex justify-center items-center'>
            <Spinner label='Cargando productos...' />
          </div>
        ) : (
          <ProductsTable
            wrapperHeight={tableWrapperHeight}
            filterValue={filterValue}
            selectedCategories={selectedCategories}
            selectedProviders={selectedProviders}
          />
        )}
      </motion.div>
    </div>
  )
}

export default Catalogo
