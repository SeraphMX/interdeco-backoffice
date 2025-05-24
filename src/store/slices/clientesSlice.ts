import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cliente } from '../../types';
import { initialClientes } from '../../data/initialClientes';

interface ClientesState {
  items: Cliente[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientesState = {
  items: initialClientes,
  loading: false,
  error: null,
};

const clientesSlice = createSlice({
  name: 'clientes',
  initialState,
  reducers: {
    addCliente: (state, action: PayloadAction<Cliente>) => {
      state.items.push(action.payload);
    },
    updateCliente: (state, action: PayloadAction<Cliente>) => {
      const index = state.items.findIndex(cliente => cliente.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCliente: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(cliente => cliente.id !== action.payload);
    },
  },
});

export const { addCliente, updateCliente, deleteCliente } = clientesSlice.actions;
export default clientesSlice.reducer;