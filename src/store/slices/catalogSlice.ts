// src/store/catalogSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Category {
  id: number
  description: string
  color: string
}

interface CatalogState {
  categorias: Category[]
}

const initialState: CatalogState = {
  categorias: []
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categorias = action.payload
    },
    addCategory(state, action: PayloadAction<Category>) {
      state.categorias.push(action.payload)
    },
    updateCategory(state, action: PayloadAction<Category>) {
      const index = state.categorias.findIndex((cat) => cat.id === action.payload.id)
      if (index !== -1) state.categorias[index] = action.payload
    },
    removeCategory(state, action: PayloadAction<number>) {
      state.categorias = state.categorias.filter((cat) => cat.id !== action.payload)
    }
  }
})

export const { setCategories, addCategory, updateCategory, removeCategory } = catalogSlice.actions
export default catalogSlice.reducer
