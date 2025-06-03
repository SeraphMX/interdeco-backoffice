// src/store/catalogSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Category {
  id: number
  description: string
  color: string
}

export interface Provider {
  id: number
  name: string
}

interface CatalogState {
  categorias: Category[]
  proveedores: Provider[]
}

const initialState: CatalogState = {
  categorias: [],
  proveedores: []
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
    },
    setProviders(state, action: PayloadAction<Provider[]>) {
      state.proveedores = action.payload
    },
    addProvider(state, action: PayloadAction<Provider>) {
      state.proveedores.push(action.payload)
    },
    updateProvider(state, action: PayloadAction<Provider>) {
      const index = state.proveedores.findIndex((prov) => prov.id === action.payload.id)
      if (index !== -1) state.proveedores[index] = action.payload
    },
    removeProvider(state, action: PayloadAction<number>) {
      state.proveedores = state.proveedores.filter((prov) => prov.id !== action.payload)
    }
  }
})

export const { setCategories, addCategory, updateCategory, removeCategory } = catalogSlice.actions
export default catalogSlice.reducer
