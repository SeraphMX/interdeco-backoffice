import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cotizacion } from '../../types';
import { initialCotizaciones } from '../../data/initialCotizaciones';

interface CotizacionesState {
  items: Cotizacion[];
  loading: boolean;
  error: string | null;
}

const initialState: CotizacionesState = {
  items: initialCotizaciones,
  loading: false,
  error: null,
};

const cotizacionesSlice = createSlice({
  name: 'cotizaciones',
  initialState,
  reducers: {
    addCotizacion: (state, action: PayloadAction<Cotizacion>) => {
      state.items.push(action.payload);
    },
    updateCotizacion: (state, action: PayloadAction<Cotizacion>) => {
      const index = state.items.findIndex(cotizacion => cotizacion.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCotizacion: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(cotizacion => cotizacion.id !== action.payload);
    },
  },
});

export const { addCotizacion, updateCotizacion, deleteCotizacion } = cotizacionesSlice.actions;
export default cotizacionesSlice.reducer;