import { Spinner } from '@heroui/react'
import { lazy, Suspense } from 'react'
import { Provider } from 'react-redux'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AppStart } from './AppStart'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Catalogo from './pages/Catalogo'
import Clientes from './pages/Clientes'
import { default as Cotizacion, default as Quote } from './pages/Cotizacion'
import Cotizaciones from './pages/Cotizaciones'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Users from './pages/Users'
import { store } from './store'

const QuotePreviewPage = lazy(() => import('./pages/PreviewPDF').then((module) => ({ default: module.QuotePreviewPage })))

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppStart />
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
                <Route path='/cotizaciones/nueva' element={<Quote />} />
                <Route path='/usuarios' element={<Users />} />
              </Route>

              <Route path='/cotizaciones/preview' element={<QuotePreviewPage />} />
              <Route path='/cotizacion/:token' element={<Cotizacion />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </Provider>
  )
}

export default App
