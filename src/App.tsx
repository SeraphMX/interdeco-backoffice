import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Materiales from './pages/Materiales';
import Cotizaciones from './pages/Cotizaciones';
import NuevaCotizacion from './pages/NuevaCotizacion';
import Productos from './pages/Productos';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/materiales" element={<Materiales />} />
              <Route path="/cotizaciones" element={<Cotizaciones />} />
              <Route path="/cotizaciones/nueva" element={<NuevaCotizacion />} />
              <Route path="/productos" element={<Productos />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;