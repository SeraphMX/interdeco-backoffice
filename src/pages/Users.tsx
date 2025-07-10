import { Button, useDisclosure } from '@heroui/react'
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
    <div className='space-y-6 h-full flex flex-col'>
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

      <section className='flex-grow overflow-hidden shadow-medium rounded-lg ' ref={tableWrapperRef}>
        <UsersTable wrapperHeight={tableWrapperHeight} filterValue={filterValue} onRowAction={onOpenEditAdd} />
      </section>

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
