import { Button, Chip, NumberInput } from '@heroui/react'
import { motion, Variant } from 'framer-motion'
import { Minus, Tag } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { QuoteItem } from '../../../types'
import { formatCurrency } from '../../../utils/currency'

interface QuoteItemProps {
  item: QuoteItem
  onUpdateQuantity: (item: QuoteItem, quantity: number) => void
  onRemoveItem: (item: QuoteItem) => void
  onSetDiscount: (item: QuoteItem) => void
  itemVariants?: {
    hidden: Variant
    show: Variant
  }
  isLastItem?: boolean
  scrollRef?: React.RefObject<HTMLDivElement>
}

const QuoteItemSingle = ({ item, onUpdateQuantity, onRemoveItem, onSetDiscount, itemVariants, isLastItem, scrollRef }: QuoteItemProps) => {
  const rxQuote = useSelector((state: RootState) => state.quote)
  const rxCategories = useSelector((state: RootState) => state.catalog.categories)

  const category = rxCategories.find((c) => c.id === item.product?.category) || {
    description: 'Sin categoría',
    color: 'bg-gray-300'
  }
  const surplus = item.totalQuantity - item.requiredQuantity
  const isExceeding = surplus > 0
  const pricePerPackage = Number(
    ((item.product?.price ?? 0) * (1 + (item.product?.utility ?? 0) / 100) * (item.product?.package_unit ?? 1)).toFixed(2)
  )

  return (
    <motion.article
      key={item.product?.id}
      className='bg-white shadow-sm border rounded-lg overflow-hidden'
      variants={itemVariants}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 20,
        velocity: 0.1
      }}
      layout
      onAnimationStart={() => {
        if (isLastItem && scrollRef?.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }}
    >
      <header className='flex items-center flex-col sm:flex-row justify-between gap-4 p-4 bg-gray-50'>
        <section>
          <h3 className='font-medium text-lg flex flex-col sm:flex-row sm:gap-2 items-start'>
            <span className='font-semibold'>{item.product?.sku}</span> {item.product?.spec}
            <Chip className={category.color} size='sm' variant='flat'>
              {category.description}
            </Chip>
          </h3>
          <p className='text-gray-600'>{item.product?.description}</p>
        </section>

        {!rxQuote.isPublicAccess && (
          <section className='flex items-center gap-2'>
            {rxQuote.data.status === 'open' && (
              <>
                <Button isIconOnly color='success' variant='light' aria-label='Agregar descuento' onPress={() => onSetDiscount(item)}>
                  <Tag size={18} />
                </Button>

                <NumberInput
                  className='w-20'
                  value={item.requiredQuantity}
                  size='sm'
                  aria-label='Cantidad requerida'
                  onValueChange={(value) => onUpdateQuantity(item, value)}
                  onFocus={(e) => {
                    const input = e.target as HTMLInputElement
                    input.select()
                  }}
                  classNames={{ input: 'text-right' }}
                  minValue={1}
                  min={1}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur() // 👈 aquí haces que pierda el foco
                    }
                  }}
                />
                <Button isIconOnly color='danger' variant='light' aria-label='Eliminar artículo' onPress={() => onRemoveItem(item)}>
                  <Minus size={18} />
                </Button>
              </>
            )}
          </section>
        )}
      </header>

      <section className='border-t border-gray-200 p-4'>
        {/* Sección de detalles */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <section>
            {/* Bloque de cantidades */}
            <h4 className='sr-only'>Detalles de cantidades</h4> {/* Título oculto solo para accesibilidad */}
            <dl className='space-y-3'>
              {/* Lista de definiciones */}
              <div className='flex justify-between'>
                <dt>{item.product?.measurement_unit} Requeridos</dt>
                <dd className='text-gray-600'>{item.requiredQuantity} </dd>
              </div>
              {isExceeding && (
                <div className='flex justify-between'>
                  <dt>{item.product?.measurement_unit} Cotizados</dt>
                  <dd className='text-gray-600'>{item.totalQuantity.toFixed(2)}</dd>
                </div>
              )}
              {surplus > 0 && (
                <div className='flex justify-between'>
                  <dt>Excedente</dt>
                  <dd className='text-gray-600'>
                    {surplus.toFixed(2)} {item.product?.measurement_unit}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section>
            <h4 className='sr-only'>Detalles de precios</h4>
            <dl className='space-y-3'>
              {isExceeding && (
                <div className='flex justify-between'>
                  <dt className='font-semibold'>Paquetes necesarios</dt>
                  <dd className='text-gray-600'>{item.packagesRequired}</dd>
                </div>
              )}

              <div className='flex justify-between'>
                <dt>Precio por paquete</dt>
                <dd className='text-gray-600'>{formatCurrency(pricePerPackage)}</dd>
              </div>
              <div className='flex justify-between'>
                <dt className={`${!item.discount && 'font-semibold'}`}>Subtotal</dt>
                <dd className={`${!item.discount && 'font-medium text-lg'} text-gray-600 `}>
                  {formatCurrency(item.discount ? (item.originalSubtotal ?? 0) : (item.subtotal ?? 0))}
                </dd>
              </div>

              {(item.discount ?? 0) > 0 && (
                <>
                  <div className='flex justify-between'>
                    <dt className='flex items-center gap-2'>
                      Descuento
                      <Chip color='success' classNames={{ base: 'text-xs' }} size='sm' variant='flat'>
                        {item.discountType === 'percentage' ? item.discount : 'Fijo'}
                        {item.discountType === 'percentage' && '%'}
                      </Chip>
                    </dt>
                    <dd className='text-gray-600'>
                      -
                      {formatCurrency(
                        item.discountType === 'percentage'
                          ? (item.originalSubtotal ?? 0) * ((item.discount ?? 0) / 100)
                          : (item.discount ?? 0)
                      )}
                    </dd>
                  </div>

                  <div className='flex justify-between'>
                    <dt className='font-semibold'>Subtotal</dt>
                    <dd className='text-gray-600 font-medium text-lg'>{formatCurrency(item.subtotal || 0)}</dd>
                  </div>
                </>
              )}
            </dl>
          </section>
        </div>
      </section>
    </motion.article>
  )
}

export default QuoteItemSingle
