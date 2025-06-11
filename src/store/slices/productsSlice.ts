import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Product } from '../../types'

interface ProductsState {
  items: Product[]
  selectedProduct?: Product | null
  loading: boolean
  error: string | null
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null
}

const productoSlice = createSlice({
  name: 'productos',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.items = action.payload
      state.loading = false
      state.error = null
    },
    setSelectedProduct(state, action: PayloadAction<Product | null>) {
      state.selectedProduct = action.payload
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.items.push(action.payload)
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const index = state.items.findIndex((product) => product.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
    removeProduct(state, action: PayloadAction<number>) {
      state.items = state.items.filter((product) => product.id !== action.payload)
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    }
  }
})

export const { setProducts, addProduct, updateProduct, removeProduct, setLoading, setError, setSelectedProduct, clearSelectedProduct } =
  productoSlice.actions
export default productoSlice.reducer
