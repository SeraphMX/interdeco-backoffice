import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import catalogReducer from './slices/catalogSlice'
import cotizacionesReducer from './slices/cotizacionesSlice'
import clientesReducer from './slices/customersSlice'
import productsReducer from './slices/productsSlice'
import quoteReducer from './slices/quoteSlice'

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    clientes: clientesReducer,
    cotizaciones: cotizacionesReducer,
    quote: quoteReducer,
    productos: productsReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
