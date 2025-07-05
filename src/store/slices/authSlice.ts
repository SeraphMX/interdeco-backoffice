import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialUsers } from '../../data/initialUsers'
import { User } from '../../types'

export interface AuthState {
  users: User[]
  currentUser: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  users: initialUsers,
  currentUser: null,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      const user = state.users.find((u) => u.email === action.payload.email && u.password === action.payload.password)
      if (user) {
        state.currentUser = user
        state.error = null
      } else {
        state.error = 'Credenciales inválidas'
      }
    },
    logout: (state) => {
      state.currentUser = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const { login, logout, clearError } = authSlice.actions
export default authSlice.reducer
