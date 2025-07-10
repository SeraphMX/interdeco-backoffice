import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  SortDescriptor,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure
} from '@heroui/react'
import generator from 'generate-password-ts'
import { EllipsisVertical } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { User } from '../../schemas/user.schema'
import { userService } from '../../services/userService'
import { RootState } from '../../store'
import { setIsEditing } from '../../store/slices/productsSlice'
import { setSelectedUser, updateUser } from '../../store/slices/usersSlice'
import ModalUserConfirmDelete from './modals/ModalUserConfirmDelete'
import UsersTableFooter from './UsersTableFooter'

interface ProductsTableProps {
  wrapperHeight?: number
  filterValue?: string
  selectedCategories?: string[]
  selectedProviders?: string[]
  variant?: 'default' | 'minimal'
  onRowAction?: () => void
}

const UsersTable = ({ wrapperHeight, filterValue = '', variant = 'default', onRowAction = () => {} }: ProductsTableProps) => {
  const rxUsers = useSelector((state: RootState) => state.users.items)
  const selectedUser = useSelector((state: RootState) => state.users.selectedUser)
  const loading = useSelector((state: RootState) => state.productos.loading)
  const isEditing = useSelector((state: RootState) => state.productos.isEditing)
  const dispatch = useDispatch()
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'role', direction: 'ascending' })

  const { isOpen: isOpenConfirmDelete, onOpen: onOpenConfirmDelete, onOpenChange: onOpenChangeConfirmDelete } = useDisclosure()

  const filteredItems = useMemo(() => {
    return rxUsers.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.email.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.phone?.toLowerCase().includes(filterValue.toLowerCase())

      //   const matchesCategories = selectedCategories.length === 0 || selectedCategories.find((c) => c === user.category.toString())

      return matchesSearch
    })
  }, [rxUsers, filterValue])

  const sortedItems = [...filteredItems].sort((a, b) => {
    const column = sortDescriptor.column
    const direction = sortDescriptor.direction

    const first = a[column as keyof typeof a]
    const second = b[column as keyof typeof b]
    let cmp = 0
    if (typeof first === 'number' && typeof second === 'number') {
      cmp = first - second
    } else {
      cmp = (first ?? '').toString().localeCompare((second ?? '').toString(), 'es', { sensitivity: 'base' })
    }

    return direction === 'descending' ? -cmp : cmp
  })
  const headerColumns = [
    { name: 'NOMBRE', uid: 'name', sortable: true },
    { name: 'CORREO ELECTRÓNICO', uid: 'email', sortable: true, align: 'start' },
    { name: 'TELÉFONO', uid: 'phone', align: 'start' },
    { name: 'ROL', uid: 'role', sortable: true, align: 'center' },
    { name: 'ACTIVO', uid: 'is_active', sortable: true, align: 'end' },
    { name: 'ACCIONES', uid: 'actions', align: 'center' }
  ]

  const handleUserStatus = async (user: User, status: boolean) => {
    const previous = user.is_active // Guardamos valor previo por si hay que revertir
    // 1. Optimistic update
    dispatch(updateUser({ ...user, is_active: status }))
    try {
      // 2. Actualiza en backend
      await userService.setUserActive(user, status)
    } catch (error) {
      // 3. Revertir si falla
      dispatch(updateUser({ ...user, is_active: previous }))
      console.error('Error al actualizar el estado del usuario:', error)
    }
  }

  const handleEditUser = (user: User) => {
    dispatch(setSelectedUser(user))
    onRowAction()
  }

  const handleDeleteUser = async () => {
    if (!selectedUser?.id) return
    const deletedUser = await userService.deleteUser(selectedUser.id)

    if (deletedUser) {
      dispatch(setSelectedUser(null))
      onOpenChangeConfirmDelete()
    } else {
      console.error('Error al eliminar el usuario')
    }
  }

  const handleResetPassword = async (user: User) => {
    //const password = userService.generatePassword()

    const password = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      strict: true
    })

    await userService.passwordChange(user, password)
  }

  useEffect(() => {
    return () => {
      // Esto se ejecuta al desmontar
      dispatch(setIsEditing(false))
    }
  }, [dispatch])

  return (
    <>
      <Table
        isVirtualized
        color='primary'
        maxTableHeight={wrapperHeight}
        aria-label='Tabla de usuarios'
        isHeaderSticky
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        selectionMode={isEditing ? 'none' : 'single'}
        selectionBehavior='replace'
        onRowAction={() => onRowAction()}
        disallowEmptySelection
        bottomContent={<UsersTableFooter filteredItemsCount={filteredItems.length} />}
        className='overflow-auto z-10'
        classNames={{
          th: 'bg-teal-500 text-white font-semibold data-[hover=true]:text-foreground-600'
        }}
        onSelectionChange={(key) => {
          const selectedId = Array.from(key)[0]
          const user = rxUsers.find((u) => u.id == selectedId)
          dispatch(setSelectedUser(user || null))
        }}
        shadow='none'
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              allowsSorting={column.sortable}
              align={(column.align as 'center' | 'start' | 'end' | undefined) || 'start'}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={sortedItems}
          isLoading={loading}
          loadingContent={
            <div className='bg-white/20 backdrop-blur-md w-full h-full flex justify-center items-center'>
              <Spinner label='Cargando datos...' />
            </div>
          }
        >
          {(user: User) => {
            return (
              <TableRow key={user.id}>
                <TableCell className='w-full'>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || 'N/A'}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell hidden={variant === 'minimal' ? true : false} className='text-center'>
                  <Switch
                    aria-label='Status del usuario'
                    isSelected={user.is_active}
                    onValueChange={(val) => handleUserStatus(user, val)}
                  />
                </TableCell>
                <TableCell>
                  <Dropdown placement='left'>
                    <DropdownTrigger>
                      <Button variant='light' startContent={<EllipsisVertical />} isIconOnly size='sm'></Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label='Static Actions'>
                      <DropdownItem key='preview' onPress={() => handleEditUser(user)}>
                        Editar
                      </DropdownItem>
                      <DropdownItem key='reset-password' onPress={() => handleResetPassword(user)}>
                        Restablecer contraseña
                      </DropdownItem>
                      {!user.is_active ? (
                        <DropdownItem
                          key='delete'
                          className='text-danger'
                          color='danger'
                          onPress={() => {
                            dispatch(setSelectedUser(user))
                            onOpenConfirmDelete()
                          }}
                        >
                          Eliminar
                        </DropdownItem>
                      ) : null}
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            )
          }}
        </TableBody>
      </Table>
      <ModalUserConfirmDelete isOpen={isOpenConfirmDelete} onOpenChange={onOpenChangeConfirmDelete} onConfirm={handleDeleteUser} />
    </>
  )
}

export default UsersTable
