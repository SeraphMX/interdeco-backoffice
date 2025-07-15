import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from '@heroui/react'
import { Book, ContactRound, FileText, LogOut, Menu, UsersRound, X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSessionGuard } from '../hooks/userSessionGuard'
import { AppDispatch, RootState } from '../store'
import { logoutUser } from '../store/slices/authSlice'
import UserProfile from './user/modals/UserProfile'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useSelector((state: RootState) => state.auth)
  const { isOpen, onOpenChange, onOpen } = useDisclosure()

  useSessionGuard()

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-gray-100' : ''
  }

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login', { replace: true })
  }

  let navItems = []

  switch (user?.role) {
    case 'admin':
      navItems = [
        { path: '/clientes', icon: ContactRound, label: 'Clientes' },
        { path: '/catalogo', icon: Book, label: 'Catálogo' },
        { path: '/cotizaciones', icon: FileText, label: 'Cotizaciones' },
        { path: '/usuarios', icon: UsersRound, label: 'Usuarios' }
      ]
      break
    default:
      navItems = navItems = [{ path: '/cotizaciones', icon: FileText, label: 'Cotizaciones' }]
      break
  }

  return (
    <nav className='bg-white text-gray-700 shadow'>
      <div className='container mx-auto px-4'>
        <div className='relative flex items-center justify-between h-16'>
          {/* Logo - always visible */}
          <Link to='/' className='flex items-center space-x-2 font-bold text-gray-700'>
            <img src='/branding/logo-ideco.svg' className='w-5' alt='logo-interdeco' />
            <span className='text-xl'>InterDeco</span>
          </Link>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <Button isIconOnly variant='light' onPress={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <div className='hidden md:flex md:items-center md:space-x-4'>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-gray-100 ${isActive(
                  item.path
                )}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}

            <Dropdown placement='bottom-end'>
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as='button'
                  className='transition-transform'
                  color='primary'
                  size='sm'
                  src='https://i.pravatar.cc/150?u=a042581f4e29026704d'
                />
              </DropdownTrigger>
              <DropdownMenu aria-label='Profile Actions' variant='flat'>
                <DropdownItem key='profile' className='h-14 gap-2'>
                  <p className='font-semibold'>{user?.full_name}</p>
                  <p className='font-semibold'>{user?.email}</p>
                </DropdownItem>
                <DropdownItem key='settings' onPress={onOpen}>
                  Mi perfil
                </DropdownItem>
                <DropdownItem key='logout' color='danger' onPress={handleLogout}>
                  Cerrar sesión
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:hidden absolute left-0 right-0 bg-white z-50 shadow-lg border-t border-gray-200`}
        >
          <div className='px-2 pt-2 pb-3 space-y-1'>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 hover:bg-gray-100 ${isActive(
                  item.path
                )}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
            <Button
              variant='light'
              onPress={handleLogout}
              className='text-gray-700 w-full justify-start'
              startContent={<LogOut size={20} />}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
      <UserProfile isOpen={isOpen} onOpenChange={onOpenChange} />
    </nav>
  )
}

export default Navbar
