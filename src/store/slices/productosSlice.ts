import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Producto } from '../../types';
import { initialProductos } from '../../data/initialProductos';

interface ProductosState {
  items: Producto[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductosState = {
  items: initialProductos,
  loading: false,
  error: null,
};

const productosSlice = createSlice({
  name: 'productos',
  initialState,
  reducers: {
    addProducto: (state, action: PayloadAction<Producto>) => {
      state.items.push(action.payload);
    },
    updateProducto: (state, action: PayloadAction<Producto>) => {
      const index = state.items.findIndex(producto => producto.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteProducto: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(producto => producto.id !== action.payload);
    },
  },
});

export const { addProducto, updateProducto, deleteProducto } = productosSlice.actions;
export default productosSlice.reducer;