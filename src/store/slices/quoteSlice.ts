import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Customer, Product, QuoteItem } from '../../types'

interface QuoteState {
  selectedCustomer: Customer | null
  calculatedArea?: number
  items: QuoteItem[]
  selectedItem: QuoteItem | null
}

const initialState: QuoteState = {
  selectedCustomer: null,
  calculatedArea: 0,
  items: [],
  selectedItem: null
}

const quoteSlice = createSlice({
  name: 'quote',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      console.log('first')
      state.selectedCustomer = action.payload
      console.log('Sec')
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null
    },
    setCalculatedArea: (state, action: PayloadAction<number>) => {
      state.calculatedArea = action.payload
    },
    clearCalculatedArea: (state) => {
      state.calculatedArea = 0
    },
    setSelectedItem: (state, action: PayloadAction<QuoteItem | null>) => {
      state.selectedItem = action.payload
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
    addItem: (state, action: PayloadAction<QuoteItem>) => {
      const existingItemIndex = state.items.findIndex((item) => item.product === action.payload.product)
      if (existingItemIndex !== -1) {
        // If item already exists, update the quantity
        state.items[existingItemIndex].requiredQuantity += action.payload.requiredQuantity
        state.items[existingItemIndex].totalQuantity += action.payload.totalQuantity
        state.items[existingItemIndex].subtotal += action.payload.subtotal
      } else {
        // Otherwise, add the new item
        state.items.push(action.payload)
      }
    },

    removeItem: (state, action: PayloadAction<Product>) => {
      const itemIndex = state.items.findIndex((item) => item.product === action.payload)
      if (itemIndex !== -1) {
        state.items.splice(itemIndex, 1)
      }
    },
    clearItems: (state) => {
      state.items = []
    }
  }
})

export const {
  setSelectedCustomer,
  clearSelectedCustomer,
  addItem,
  removeItem,
  clearItems,
  setCalculatedArea,
  clearCalculatedArea,
  setSelectedItem,
  clearSelectedItem
} = quoteSlice.actions

export default quoteSlice.reducer
