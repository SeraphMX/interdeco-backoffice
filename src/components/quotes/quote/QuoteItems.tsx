import { Card, CardBody, Spinner, useDisclosure } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { PackagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { quoteService } from '../../../services/quoteService'
import { RootState } from '../../../store'
import { removeItem, setSelectedItem, updateItem } from '../../../store/slices/quoteSlice'
import { QuoteItem } from '../../../types'
import ModalAddDiscount from '../modals/ModalAddDiscount'
import ModalAddObservation from '../modals/ModalAddObservation'
import ModalConfirmRemoveItem from '../modals/ModalConfirmRemoveItem'
import QuoteItemSingle from './QuoteItemSingle'

interface QuoteItemsProps {
  scrollRef: React.RefObject<HTMLDivElement>
}

const QuoteItems = ({ scrollRef }: QuoteItemsProps) => {
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)
  const { isOpen: isOpenAddDiscount, onOpen: onOpenAddDiscount, onOpenChange: onOpenChangeAddDiscount } = useDisclosure()
  const { isOpen: isOpenConfirmRemoveItem, onOpen: onOpenConfirmRemoveItem, onOpenChange: onOpenChangeConfirmRemoveItem } = useDisclosure()
  const { isOpen: isOpenAddObservation, onOpen: onOpenAddObservation, onOpenChange: onOpenChangeAddObservation } = useDisclosure()

  // Contador para controlar cuántos items mostrar
  const [visibleCount, setVisibleCount] = useState(0)

  const handleSetDiscount = (item: QuoteItem) => {
    dispatch(setSelectedItem(item))
    onOpenAddDiscount()
  }

  const handleAddObservation = (item: QuoteItem) => {
    dispatch(setSelectedItem(item))
    onOpenAddObservation()
  }

  const handleRemoveObservation = (item: QuoteItem) => {
    dispatch(
      updateItem({
        ...item,
        observations: null
      } as QuoteItem)
    )
  }

  const handleConfirmRemoveItem = (item: QuoteItem) => {
    dispatch(setSelectedItem(item))
    onOpenConfirmRemoveItem()
  }

  const handleUpdateQuantity = (item: QuoteItem, newQuantity: number) => {
    const findItem = (quote.data.items ?? []).find((i) => i.uid === item.uid)
    if (findItem && findItem.product) {
      const updatedItem: QuoteItem = quoteService.buildQuoteItem({
        ...findItem,
        requiredQuantity: newQuantity,
        product: findItem.product
      })
      dispatch(updateItem(updatedItem))
    }
  }

  const handleRemoveItem = () => {
    dispatch(removeItem(quote.selectedItem as QuoteItem))
    onOpenChangeConfirmRemoveItem()
  }

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.3 // delay entre hijos (no estrictamente necesario aquí)
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  // Cada 1.5 segundos se muestra un item más (si quedan)
  useEffect(() => {
    //console.log('Visible count:', visibleCount, 'items length:', quote.data.items?.length, 'items loaded:', quote.itemsLoaded)

    const items = quote.data.items ?? []

    if (!quote.itemsLoaded || items.length === 0) return

    if (visibleCount < items.length) {
      const timeout = setTimeout(() => {
        setVisibleCount((prev) => prev + 1)
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 300) // Ajusta el tiempo para controlar la velocidad

      return () => clearTimeout(timeout)
    }
  }, [visibleCount, quote.data.items, quote.itemsLoaded, scrollRef])

  // Reinicia el contador cuando termina la carga de items
  useEffect(() => {
    if (quote.itemsLoaded) {
      setVisibleCount(0)
    }
  }, [quote.itemsLoaded])

  return (
    <AnimatePresence mode='wait'>
      <Card className='rounded-none'>
        <CardBody>
          <div className='space-y-5 p-2'>
            {!quote.itemsLoaded && visibleCount === 0 ? (
              <motion.section
                className='flex flex-col items-center justify-center h-48 space-y-2'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onAnimationComplete={() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({
                      top: scrollRef.current.scrollHeight,
                      behavior: 'smooth'
                    })
                  }
                }}
                layout
              >
                <Spinner size='lg' label='Cargando productos...' />
                <p className='text-center text-gray-500'>Por favor, espera mientras se cargan los productos</p>
              </motion.section>
            ) : quote.data.items?.length === 0 ? (
              <section className='flex flex-col items-center justify-center h-48 space-y-2'>
                <PackagePlus size={48} className='mx-auto text-gray-400 ' />
                <h2 className='text-center text-gray-600 text-lg font-medium'>No hay productos</h2>
                <p className='text-center text-gray-500'>Agrega productos para comenzar a cotizar</p>
              </section>
            ) : (
              <motion.div className='space-y-5' variants={containerVariants} initial='hidden' animate='show'>
                {(quote.data.items ?? []).slice(0, visibleCount).map((item, index, arr) => (
                  <QuoteItemSingle
                    key={item.uid}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleConfirmRemoveItem}
                    onSetDiscount={handleSetDiscount}
                    onAddObservation={handleAddObservation}
                    onRemoveObservation={handleRemoveObservation}
                    itemVariants={itemVariants}
                    isLastItem={index === arr.length - 1}
                    scrollRef={scrollRef}
                  />
                ))}
              </motion.div>
            )}
            <ModalAddDiscount isOpen={isOpenAddDiscount} onOpenChange={onOpenChangeAddDiscount} />
            <ModalAddObservation isOpen={isOpenAddObservation} onOpenChange={onOpenChangeAddObservation} />
            <ModalConfirmRemoveItem
              isOpen={isOpenConfirmRemoveItem}
              onOpenChange={onOpenChangeConfirmRemoveItem}
              onConfirm={handleRemoveItem}
            />
          </div>
        </CardBody>
      </Card>
    </AnimatePresence>
  )
}

export default QuoteItems
