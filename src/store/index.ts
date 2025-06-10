import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import catalogReducer from './slices/catalogSlice'
import cotizacionesReducer from './slices/cotizacionesSlice'
import clientesReducer from './slices/customersSlice'
import materialesReducer from './slices/materialesSlice'
import productosReducer from './slices/productosSlice'
import quoteReducer from './slices/quoteSlice'

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    clientes: clientesReducer,
    materiales: materialesReducer,
    cotizaciones: cotizacionesReducer,
    quote: quoteReducer,
    productos: productosReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
