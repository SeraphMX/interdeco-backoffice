import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Quote } from '../../types'

export interface QuotesState {
  loading?: boolean
  items: Quote[]
}

const initialState: QuotesState = {
  items: []
}

const clientsSlice = createSlice({
  name: 'cotizaciones',
  initialState,
  reducers: {
    setQuotes(state, action: PayloadAction<Quote[]>) {
      state.items = action.payload
    },
    addQuote(state, action: PayloadAction<Quote>) {
      state.items.push(action.payload)
    },
    updateQuote(state, action: PayloadAction<Quote>) {
      const index = state.items.findIndex((client) => client.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
    removeQuote(state, action: PayloadAction<Quote>) {
      state.items = state.items.filter((client) => client.id !== action.payload.id)
    },
    clearQuotes() {
      return initialState
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    }
  }
})

export const { setQuotes, addQuote, updateQuote, removeQuote, clearQuotes, setLoading } = clientsSlice.actions
export default clientsSlice.reducer
