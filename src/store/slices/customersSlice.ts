import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Customer } from '../../types'

interface CustomerState {
  items: Customer[]
}

const initialState: CustomerState = {
  items: []
}

const clientsSlice = createSlice({
  name: 'clientes',
  initialState,
  reducers: {
    setCustomers(state, action: PayloadAction<Customer[]>) {
      state.items = action.payload
    },
    addCustomer(state, action: PayloadAction<Customer>) {
      state.items.push(action.payload)
    },
    updateCustomer(state, action: PayloadAction<Customer>) {
      const index = state.items.findIndex((client) => client.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
    removeCustomer(state, action: PayloadAction<number>) {
      state.items = state.items.filter((client) => client.id !== action.payload)
    }
  }
})

export const { setCustomers, addCustomer, updateCustomer, removeCustomer } = clientsSlice.actions
export default clientsSlice.reducer
