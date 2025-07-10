import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuotes } from '../hooks/useQuotes'
import { RootState } from '../store'
import { Spinner } from '@heroui/react'

interface ProtectedRouteProps {
  children?: React.ReactNode
  requiredRole?: 'admin' | 'staff'
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  useQuotes()

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='lg' label='Cargando sesión...' />
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to='/' replace />
  }

  if (children) {
    return (
      <>
        {children}
        <main className='container mx-auto px-4 py-8 flex-grow min-h-screen-minus-navbar'>
          <Outlet />
        </main>
      </>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
