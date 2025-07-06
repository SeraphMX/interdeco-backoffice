import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuotes } from '../hooks/useQuotes'
import { RootState } from '../store'

interface ProtectedRouteProps {
  children?: React.ReactNode
  requiredRole?: 'admin' | 'staff'
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { currentUser } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  useQuotes()

  if (!currentUser) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== 'admin') {
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
