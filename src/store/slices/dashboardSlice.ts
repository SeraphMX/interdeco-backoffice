import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Period } from '../../types'

interface CategoryDistribution {
  type: 'quote_items' | 'all_products'
  data: { category: string; total: number }[]
}

interface ProviderDistribution {
  type: 'quote_items' | 'all_products'
  data: { provider: string; total: number }[]
}

interface TopProducts {
  type: 'products' | 'categories' | 'providers'
  data: {
    id: number
    name: string
    quotes: number
    total: number
  }[]
}

interface StackedByCategoryProvider {
  type: 'all_products' | 'quote_items'
  data: {
    category: string
    series: {
      provider: string
      total: number
    }[]
  }[]
}

interface DashboardState {
  selectedPeriod: Period
  top_products: TopProducts[]
  distribution_by_category: CategoryDistribution[]
  distribution_by_provider: ProviderDistribution[]
  stacked_by_category_provider: StackedByCategoryProvider[]
}

const initialState: DashboardState = {
  selectedPeriod: 'week',
  top_products: [],
  distribution_by_category: [],
  distribution_by_provider: [],
  stacked_by_category_provider: []
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
    },
    setMetrics(state, action: PayloadAction<Omit<DashboardState, 'selectedPeriod'>>) {
      state.top_products = action.payload.top_products
      state.distribution_by_category = action.payload.distribution_by_category
      state.distribution_by_provider = action.payload.distribution_by_provider
      state.stacked_by_category_provider = action.payload.stacked_by_category_provider
    }
  }
})

export const { setSelectedPeriod, clearSelectedPeriod, setMetrics } = dashboardSlice.actions

export default dashboardSlice.reducer
