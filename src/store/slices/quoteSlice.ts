import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { quoteService } from '../../services/quoteService'
import { Customer, Quote, QuoteItem, QuoteStatus } from '../../types'

interface QuoteState {
  selectedCustomer: Customer | null
  calculatedArea?: number

  selectedItem: QuoteItem | null
  data: Quote
}

const initialState: QuoteState = {
  selectedCustomer: null,
  calculatedArea: 0,
  selectedItem: null,
  data: {
    id: null,
    customer_id: null,
    created_at: null,
    last_updated: null,
    items: [],
    total: 0,
    status: 'open'
  }
}

const quoteSlice = createSlice({
  name: 'quote',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      console.log('first')
      state.selectedCustomer = action.payload
      state.data.customer_id = action.payload?.id ?? null
      console.log('Sec')
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null
      state.data.customer_id = null
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
      const existingItemIndex = (state.data.items ?? []).findIndex((item) => item.product.id === action.payload.product.id)
      if (existingItemIndex !== -1) {
        // If item already exists, update the quantity
        if (state.data.items && state.data.items[existingItemIndex]) {
          state.data.items[existingItemIndex].requiredQuantity += action.payload.requiredQuantity
          state.data.items[existingItemIndex].totalQuantity += action.payload.totalQuantity
          state.data.items[existingItemIndex].subtotal += action.payload.subtotal
        }
      } else {
        // Otherwise, add the new item
        ;(state.data.items ?? []).push(action.payload)
      }
    },
    updateItem: (state, action: PayloadAction<QuoteItem>) => {
      const index = (state.data.items ?? []).findIndex((i) => i.product.id === action.payload.product.id)
      if (index !== -1) {
        const updated = quoteService.buildQuoteItem({
          product: action.payload.product,
          requiredQuantity: action.payload.requiredQuantity,
          discount: action.payload.discount,
          discountType: action.payload.discountType,
          id: action.payload.id
        })

        if (state.data.items) {
          state.data.items[index] = updated
        }
      }
    },

    removeItem: (state, action: PayloadAction<QuoteItem>) => {
      const itemIndex = (state.data.items ?? []).findIndex((item) => item.product.id === action.payload.product.id)
      if (itemIndex !== -1) {
        ;(state.data.items ?? []).splice(itemIndex, 1)
      }
    },
    clearItems: (state) => {
      state.data.items = []
    },
    setQuoteId: (state, action: PayloadAction<number | null>) => {
      state.data.id = action.payload
    },
    setQuoteTotal: (state, action: PayloadAction<number>) => {
      state.data.total = action.payload
    },
    setQuoteStatus: (state, action: PayloadAction<string | null>) => {
      state.data.status = action.payload as QuoteStatus | 'open'
    }
  }
})

export const {
  setSelectedCustomer,
  clearSelectedCustomer,
  addItem,
  updateItem,
  removeItem,
  clearItems,
  setCalculatedArea,
  clearCalculatedArea,
  setSelectedItem,
  clearSelectedItem,
  setQuoteId,
  setQuoteTotal,
  setQuoteStatus
} = quoteSlice.actions

export default quoteSlice.reducer
