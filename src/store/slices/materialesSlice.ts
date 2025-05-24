import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Material } from '../../types';
import { initialMateriales } from '../../data/initialMateriales';

interface MaterialesState {
  items: Material[];
  loading: boolean;
  error: string | null;
}

const initialState: MaterialesState = {
  items: initialMateriales,
  loading: false,
  error: null,
};

const materialesSlice = createSlice({
  name: 'materiales',
  initialState,
  reducers: {
    addMaterial: (state, action: PayloadAction<Material>) => {
      state.items.push(action.payload);
    },
    updateMaterial: (state, action: PayloadAction<Material>) => {
      const index = state.items.findIndex(material => material.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteMaterial: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(material => material.id !== action.payload);
    },
  },
});

export const { addMaterial, updateMaterial, deleteMaterial } = materialesSlice.actions;
export default materialesSlice.reducer;