import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import catalogReducer from './slices/catalogSlice'
import clientesReducer from './slices/clientesSlice'
import cotizacionesReducer from './slices/cotizacionesSlice'
import materialesReducer from './slices/materialesSlice'
import productosReducer from './slices/productosSlice'

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    clientes: clientesReducer,
    materiales: materialesReducer,
    cotizaciones: cotizacionesReducer,
    productos: productosReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
