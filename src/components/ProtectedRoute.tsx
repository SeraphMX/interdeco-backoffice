import { Spinner } from '@heroui/react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuotes } from '../hooks/useQuotes'
import { RootState } from '../store'

interface ProtectedRouteProps {
  children?: React.ReactNode
  allowedRoles?: Array<'admin' | 'staff'>
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  useQuotes()

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='lg' label='Cargando ...' />
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to='/cotizaciones' replace />
  }

  const isScrollable = location.pathname === '/'

  const mainClassName = `container mx-auto px-4 py-8 flex-grow  ${isScrollable ? 'min-h-screen-minus-navbar-scroll lg:min-h-screen-minus-navbar' : 'min-h-screen-minus-navbar'}`

  if (children) {
    return (
      <>
        {children}
        <main className={mainClassName}>
          <Outlet />
        </main>
      </>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
