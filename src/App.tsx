import { Spinner } from '@heroui/react'
import { lazy, Suspense, useState } from 'react'
import { Provider } from 'react-redux'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AppStart } from './AppStart'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Catalogo from './pages/Catalogo'
import Clientes from './pages/Clientes'
import { default as Cotizacion, default as Quote } from './pages/Cotizacion'
import Cotizaciones from './pages/Cotizaciones'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import RecoverPassword from './pages/RecoverPassword'
import ResetPassword from './pages/ResetPassword'
import Users from './pages/Users'
import { SessionBootstrapper } from './SessionBoostraper'
import { store } from './store'

const QuotePreviewPage = lazy(() => import('./pages/PreviewPDF').then((module) => ({ default: module.QuotePreviewPage })))

function App() {
  const [sessionReady, setSessionReady] = useState(false)
  return (
    <Provider store={store}>
      <Router>
        <AppStart />
        <SessionBootstrapper onReady={() => setSessionReady(true)} />
        <div className='min-h-screen bg-gray-50'>
          <Suspense
            fallback={
              <div className='flex justify-center items-center min-h-screen'>
                <Spinner size='lg' label='Cargando ...' />
              </div>
            }
          >
            {!sessionReady ? (
              <div className='flex justify-center items-center min-h-screen'>
                <Spinner size='lg' label='Validando sesión...' />
              </div>
            ) : (
              <Routes>
                <Route path='/login' element={<Login />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <Navbar />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path='/'
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/clientes'
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Clientes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/catalogo'
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Catalogo />
                      </ProtectedRoute>
                    }
                  />
                  <Route path='/cotizaciones' element={<Cotizaciones />} />
                  <Route path='/cotizaciones/nueva' element={<Quote />} />
                  <Route
                    path='/usuarios'
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                <Route path='/cotizacion' element={<PublicRoute />}>
                  <Route path=':token' element={<Cotizacion />} />
                </Route>

                <Route path='/cotizacion/preview' element={<QuotePreviewPage />} />
                <Route path='/cuenta/recover-password' element={<RecoverPassword />} />
                <Route path='/cuenta/reset-password/:token' element={<ResetPassword />} />
              </Routes>
            )}
          </Suspense>
        </div>
      </Router>
    </Provider>
  )
}

export default App
