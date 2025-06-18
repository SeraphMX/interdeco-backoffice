import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Customer, Product, Quote, QuoteItem } from '../../types'

interface QuoteState extends Quote {
  calculatedArea?: number
}

const initialState: QuoteState = {
  selectedCustomer: null,
  calculatedArea: 0,
  date: new Date().toISOString(),
  subtotal: 0,
  taxes: 0,
  discount: 0,
  total: 0,
  status: 'draft',
  items: []
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

        state.subtotal = state.items.reduce((sum, item) => sum + item.subtotal, 0)
        state.taxes = state.subtotal * 0.16 // Assuming a fixed tax rate of 16%
        state.total = state.subtotal + state.taxes - state.discount
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

export const { setSelectedCustomer, clearSelectedCustomer, addItem, removeItem, clearItems, setCalculatedArea, clearCalculatedArea } =
  quoteSlice.actions

export default quoteSlice.reducer
