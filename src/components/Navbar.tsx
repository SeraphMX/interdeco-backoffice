import { Button } from '@heroui/react'
import { Book, FileText, LogOut, Menu, Users, X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-gray-100' : ''
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navItems = [
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/catalogo', icon: Book, label: 'Catálogo' },
    { path: '/cotizaciones', icon: FileText, label: 'Cotizaciones' }
  ]

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
            <Button variant='light' onPress={handleLogout} className='text-gray-700' startContent={<LogOut size={20} />}>
              Cerrar sesión
            </Button>
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
    </nav>
  )
}

export default Navbar
