import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Customer } from '../../types'

interface QuoteState {
  selectedCustomer: Customer | null
  items: string[]
}

const initialState: QuoteState = {
  selectedCustomer: null,
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
    addItem: (state, action: PayloadAction<string>) => {
      state.items.push(action.payload)
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item !== action.payload)
    },
    clearItems: (state) => {
      state.items = []
    }
  }
})

export const { setSelectedCustomer, clearSelectedCustomer, addItem, removeItem, clearItems } = quoteSlice.actions

export default quoteSlice.reducer
