import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import catalogReducer from './slices/catalogSlice'
import clientesReducer from './slices/customersSlice'
import dashboardReducer from './slices/dashboardSlice'
import productsReducer from './slices/productsSlice'
import quoteReducer from './slices/quoteSlice'
import quotesReducer from './slices/quotesSlice'
import usersReducer from './slices/usersSlice'

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    catalog: catalogReducer,
    clientes: clientesReducer,

    quotes: quotesReducer,
    quote: quoteReducer,

    productos: productsReducer,
    auth: authReducer,
    users: usersReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
