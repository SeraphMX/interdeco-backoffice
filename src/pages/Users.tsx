import { Button, Spinner, useDisclosure } from '@heroui/react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import UsersFilters from '../components/users/UsersFilters'
import UsersTable from '../components/users/UsersTable'
import ModalUserEditAdd from '../components/users/modals/ModalUserEditAdd'
import { clearSelectedUser } from '../store/slices/usersSlice'

const Users = () => {
  const dispatch = useDispatch()
  const tableWrapperRef = useRef<HTMLDivElement>(null)

  const { isOpen: isOpenEditAdd, onOpen: onOpenEditAdd, onOpenChange: onOpenChangeEditAdd } = useDisclosure()

  const [filterValue, setFilterValue] = useState('')
  //const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [tableWrapperHeight, setwrapperHeight] = useState(0)

  const handleNewUser = () => {
    dispatch(clearSelectedUser())
    onOpenEditAdd()
  }

  useEffect(() => {
    const currentWrapper = tableWrapperRef.current

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setwrapperHeight(entry.contentRect.height)
        console.log('Altura del div actualizada:', entry.contentRect.height)
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
  return (
    <div className='gap-6 h-full flex flex-col pb-4'>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <Spinner size='lg' className='absolute' />
      </div>
      <header className='flex justify-between items-center gap-4'>
        <UsersFilters
          filters={{
            search: {
              value: filterValue,
              setValue: setFilterValue
            }
          }}
        />
        <section className='flex items-center gap-2'>
          <Button color='primary' variant='ghost' onPress={handleNewUser}>
            <Plus size={20} />
            Nuevo
          </Button>
        </section>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut', delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
        className='flex-grow overflow-hidden shadow-small rounded-lg '
        ref={tableWrapperRef}
      >
        <UsersTable wrapperHeight={tableWrapperHeight} filterValue={filterValue} onRowAction={onOpenEditAdd} />
      </motion.div>

      <ModalUserEditAdd
        isOpen={isOpenEditAdd}
        onOpenChange={onOpenChangeEditAdd}
        onSuccess={() => {
          onOpenChangeEditAdd()
        }}
      />
    </div>
  )
}

export default Users
