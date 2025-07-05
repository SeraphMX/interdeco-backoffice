// src/store/catalogSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Category, MeasureUnit, Provider } from '../../schemas/catalog.schema'

export interface CatalogState {
  categories: Category[]
  providers: Provider[]
  measureUnits: MeasureUnit[]
  selectedItem?: Category | Provider | MeasureUnit | null
  showForm: boolean
}

const initialState: CatalogState = {
  categories: [],
  providers: [],
  measureUnits: [],
  selectedItem: null,
  showForm: false
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    // Categories
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload
    },
    addCategory(state, action: PayloadAction<Category>) {
      state.categories.push(action.payload)
    },
    updateCategory(state, action: PayloadAction<Category>) {
      const index = state.categories.findIndex((cat) => cat.id === action.payload.id)
      if (index !== -1) state.categories[index] = action.payload
    },
    removeCategory(state, action: PayloadAction<number>) {
      state.categories = state.categories.filter((cat) => cat.id !== action.payload)
    },

    // Providers
    setProviders(state, action: PayloadAction<Provider[]>) {
      state.providers = action.payload
    },
    addProvider(state, action: PayloadAction<Provider>) {
      state.providers.push(action.payload)
    },
    updateProvider(state, action: PayloadAction<Provider>) {
      const index = state.providers.findIndex((prov) => prov.id === action.payload.id)
      if (index !== -1) state.providers[index] = action.payload
    },
    removeProvider(state, action: PayloadAction<number>) {
      state.providers = state.providers.filter((prov) => prov.id !== action.payload)
    },

    // MeasureUnits
    setMeasureUnits(state, action: PayloadAction<MeasureUnit[]>) {
      state.measureUnits = action.payload
    },
    addMeasureUnit(state, action: PayloadAction<MeasureUnit>) {
      state.measureUnits.push(action.payload)
    },
    updateMeasureUnit(state, action: PayloadAction<MeasureUnit>) {
      const index = state.measureUnits.findIndex((mu) => mu.key === action.payload.key)
      if (index !== -1) state.measureUnits[index] = action.payload
    },
    removeMeasureUnit(state, action: PayloadAction<string>) {
      state.measureUnits = state.measureUnits.filter((mu) => mu.key !== action.payload)
    },
    // Catalog
    setSelectedItem(state, action: PayloadAction<Category | Provider | MeasureUnit | null>) {
      state.selectedItem = action.payload
    },
    setShowForm(state, action: PayloadAction<boolean>) {
      state.showForm = action.payload
    }
  }
})

export const {
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setProviders,
  addProvider,
  updateProvider,
  removeProvider,
  setMeasureUnits,
  addMeasureUnit,
  updateMeasureUnit,
  removeMeasureUnit,
  setSelectedItem,
  setShowForm
} = catalogSlice.actions
export default catalogSlice.reducer
