import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { RootState } from '../store'

const PublicRoute = () => {
  const { currentUser } = useSelector((state: RootState) => state.auth)

  if (!currentUser) {
    //return <Navigate to='/login' state={{ from: location }} replace />
  }

  {
    return (
      <div className='flex flex-col min-h-screen'>
        <main className='container mx-auto px-4 py-8 flex-grow min-h-screen-minus-navbar'>
          <Outlet />
        </main>
      </div>
    )
  }
}

export default PublicRoute
