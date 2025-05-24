import { configureStore } from '@reduxjs/toolkit';
import clientesReducer from './slices/clientesSlice';
import materialesReducer from './slices/materialesSlice';
import cotizacionesReducer from './slices/cotizacionesSlice';
import productosReducer from './slices/productosSlice';

export const store = configureStore({
  reducer: {
    clientes: clientesReducer,
    materiales: materialesReducer,
    cotizaciones: cotizacionesReducer,
    productos: productosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;