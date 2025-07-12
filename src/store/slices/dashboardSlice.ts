import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Period } from '../../types'

interface DashboardState {
  selectedPeriod: Period
}

const initialState: DashboardState = {
  selectedPeriod: 'week'
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSelectedPeriod(state, action: PayloadAction<Period>) {
      state.selectedPeriod = action.payload
    },
    clearSelectedPeriod() {
      return initialState
    }
  }
})

export const { setSelectedPeriod, clearSelectedPeriod } = dashboardSlice.actions

export default dashboardSlice.reducer
