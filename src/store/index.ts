import { configureStore } from '@reduxjs/toolkit';
import clientesReducer from './slices/clientesSlice';
import materialesReducer from './slices/materialesSlice';
import cotizacionesReducer from './slices/cotizacionesSlice';
import productosReducer from './slices/productosSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    clientes: clientesReducer,
    materiales: materialesReducer,
    cotizaciones: cotizacionesReducer,
    productos: productosReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;