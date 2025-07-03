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
import { QuotePreviewPage } from './pages/PreviewPDF'
import Users from './pages/Users'
import { store } from './store'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className='min-h-screen bg-gray-50'>
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
        </div>
      </Router>
    </Provider>
  )
}

export default App
