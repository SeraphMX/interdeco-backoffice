import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import catalogReducer from './slices/catalogSlice'
import clientesReducer from './slices/customersSlice'
import productsReducer from './slices/productsSlice'
import quoteReducer from './slices/quoteSlice'
import quotesReducer from './slices/quotesSlice'

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    clientes: clientesReducer,

    quotes: quotesReducer,
    quote: quoteReducer,

    productos: productsReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
