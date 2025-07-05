import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RootState } from '../store'
import { AuthState } from '../store/slices/authSlice'
import { CatalogState } from '../store/slices/catalogSlice'
import { ProductsState } from '../store/slices/productsSlice'
import { QuoteState } from '../store/slices/quoteSlice'
import { QuotesState } from '../store/slices/quotesSlice'
import Clientes from './Clientes'

const mockStore = configureMockStore<RootState>()
let store: MockStoreEnhanced<RootState, object>

const initialState: RootState = {
  clientes: {
    items: [
      {
        id: 1,
        name: 'Juan Pérez',
        phone: '555-1234',
        email: 'juan@example.com',
        status: 'active',
        customer_type: 'individual',
        notes: ''
      },
      {
        id: 2,
        name: 'Empresa XYZ',
        phone: '555-5678',
        email: 'contacto@xyz.com',
        status: 'inactive',
        customer_type: 'business',
        notes: ''
      }
    ],
    selectedCustomer: null
  },
  catalog: {} as CatalogState,
  quotes: {} as QuotesState,
  quote: {} as QuoteState,
  productos: {} as ProductsState,
  auth: {} as AuthState
}

describe('Clientes Component', () => {
  beforeEach(() => {
    store = mockStore(initialState)
    store.dispatch = vi.fn()
  })

  it('muestra la lista de clientes correctamente', () => {
    render(
      <BrowserRouter>
        <Provider store={store}>
          <Clientes />
        </Provider>
      </BrowserRouter>
    )

    // Verifica que aparezcan los nombres de los clientes
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Empresa XYZ')).toBeInTheDocument()
  })

  it('filtra clientes por búsqueda', () => {
    store = mockStore(initialState) // Reset store state
    render(
      <BrowserRouter>
        <Provider store={store}>
          <Clientes />
        </Provider>
      </BrowserRouter>
    )

    const searchInput = screen.getByRole('textbox') // Asumiendo que CustomerFilters tiene input con role textbox

    // Simula escribir "Juan"
    fireEvent.change(searchInput, { target: { value: 'Juan' } })

    // Debería mostrar solo "Juan Pérez"
    expect(screen.getByText('Juan Pérez')).toBeDefined()
    expect(screen.queryByText('Empresa XYZ')).toBeNull()
  })

  it('abre modal detalles al dar clic en cliente', () => {
    render(
      <BrowserRouter>
        <Provider store={store}>
          <Clientes />
        </Provider>
      </BrowserRouter>
    )

    // Clic en el cliente "Juan Pérez"
    const clienteCard = screen.getByText('Juan Pérez')
    fireEvent.click(clienteCard)

    // Verifica que se haya llamado la acción para setSelectedCustomer
    expect(store.dispatch).toHaveBeenCalled()

    // Aquí podrías verificar que el modal de detalles está visible,
    // pero necesitarás mocks o implementaciones para ModalCustomerDetails
  })
})
