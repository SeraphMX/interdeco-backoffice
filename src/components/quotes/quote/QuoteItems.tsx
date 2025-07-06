import { Card, CardBody, useDisclosure } from '@heroui/react'
import { PackagePlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { quoteService } from '../../../services/quoteService'
import { RootState } from '../../../store'
import { removeItem, setSelectedItem, updateItem } from '../../../store/slices/quoteSlice'
import { QuoteItem } from '../../../types'
import ModalAddDiscount from '../modals/ModalAddDiscount'
import ModalConfirmRemoveItem from '../modals/ModalConfirmRemoveItem'
import QuoteItemSingle from './QuoteItemSingle'

const QuoteItems = () => {
  const dispatch = useDispatch()
  const quote = useSelector((state: RootState) => state.quote)
  const { isOpen: isOpenAddDiscount, onOpen: onOpenAddDiscount, onOpenChange: onOpenChangeAddDiscount } = useDisclosure()
  const { isOpen: isOpenConfirmRemoveItem, onOpen: onOpenConfirmRemoveItem, onOpenChange: onOpenChangeConfirmRemoveItem } = useDisclosure()
  const handleSetDiscount = (item: QuoteItem) => {
    dispatch(setSelectedItem(item))

    onOpenAddDiscount()
  }

  const handleConfirmRemoveItem = (item: QuoteItem) => {
    console.log('item para eliminar', item)
    dispatch(setSelectedItem(item))
    onOpenConfirmRemoveItem()
  }

  const handleUpdateQuantity = (item: QuoteItem, newQuantity: number) => {
    const findItem = (quote.data.items ?? []).find((i) => i.product?.id === item.product?.id)
    if (findItem) {
      if (findItem.product) {
        const updatedItem: QuoteItem = quoteService.buildQuoteItem({
          ...findItem,
          requiredQuantity: newQuantity,
          product: findItem.product
        })
        dispatch(updateItem(updatedItem))
      } else {
        console.error('Product is undefined for the selected item.')
      }
    }
  }

  const handleRemoveItem = () => {
    console.log('removiendo item', quote.selectedItem?.product?.spec ?? 'Producto no definido')
    dispatch(removeItem(quote.selectedItem as QuoteItem))
    onOpenChangeConfirmRemoveItem()
  }
  return (
    <Card className='rounded-none'>
      <CardBody>
        <div className='space-y-5 p-2'>
          {quote.data.items?.length === 0 ? (
            <section className='flex flex-col items-center justify-center h-48 space-y-2'>
              <PackagePlus size={48} className='mx-auto text-gray-400 ' />
              <h2 className='text-center text-gray-600 text-lg font-medium'>No hay productos</h2>
              <p className='text-center text-gray-500'>Agrega productos para comenzar a cotizar</p>
            </section>
          ) : (
            (quote.data.items ?? []).map((item) => {
              console.log('QuoteItems render', item, 'Producto no definido')
              return (
                <QuoteItemSingle
                  key={item.product?.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleConfirmRemoveItem}
                  onSetDiscount={handleSetDiscount}
                />
              )
            })
          )}
          <ModalAddDiscount isOpen={isOpenAddDiscount} onOpenChange={onOpenChangeAddDiscount} />
          <ModalConfirmRemoveItem
            isOpen={isOpenConfirmRemoveItem}
            onOpenChange={onOpenChangeConfirmRemoveItem}
            onConfirm={handleRemoveItem}
          />
        </div>
      </CardBody>
    </Card>
  )
}

export default QuoteItems
