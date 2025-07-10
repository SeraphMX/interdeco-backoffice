import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../../schemas/user.schema'

export interface UserState {
  items: User[]
  selectedUser?: User | null
}

const initialState: UserState = {
  items: [],
  selectedUser: null
}

const clientsSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.items = action.payload
    },
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload
    },
    clearSelectedUser(state) {
      state.selectedUser = null
    },
    addUser(state, action: PayloadAction<User>) {
      state.items.push(action.payload)
    },
    updateUser(state, action: PayloadAction<User>) {
      const index = state.items.findIndex((user) => user.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
    removeUser(state, action: PayloadAction<string>) {
      state.items = state.items.filter((user) => user.id !== action.payload)
    }
  }
})

export const { setUsers, setSelectedUser, clearSelectedUser, addUser, updateUser, removeUser } = clientsSlice.actions
export default clientsSlice.reducer
