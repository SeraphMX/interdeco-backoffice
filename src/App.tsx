import { Spinner } from '@heroui/react'
import { lazy, Suspense } from 'react'
import { Provider } from 'react-redux'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Catalogo from './pages/Catalogo'
import Clientes from './pages/Clientes'
import Cotizaciones from './pages/Cotizaciones'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NuevaCotizacion from './pages/NuevaCotizacion'
import Users from './pages/Users'
import { store } from './store'

const QuotePreviewPage = lazy(() => import('./pages/PreviewPDF').then((module) => ({ default: module.QuotePreviewPage })))

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className='min-h-screen bg-gray-50'>
          <Suspense
            fallback={
              <div className='flex justify-center items-center min-h-screen'>
                <Spinner size='lg' label='Cargando ...' />
              </div>
            }
          >
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Navbar />
                  </ProtectedRoute>
                }
              >
                <Route path='/' element={<Dashboard />} />
                <Route path='/clientes' element={<Clientes />} />
                <Route path='/catalogo' element={<Catalogo />} />
                <Route path='/cotizaciones' element={<Cotizaciones />} />
                <Route path='/cotizaciones/nueva' element={<NuevaCotizacion />} />
                <Route path='/usuarios' element={<Users />} />
              </Route>

              <Route path='/cotizaciones/preview' element={<QuotePreviewPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </Provider>
  )
}

export default App
