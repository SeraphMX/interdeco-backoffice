import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '..'

export const selectProductsWithCategoryName = createSelector(
  (state: RootState) => state.productos.items,
  (state: RootState) => state.catalog.categories,
  (state: RootState) => state.catalog.providers,
  (state: RootState) => state.catalog.measureUnits,
  (products, categories, providers, measureUnits) => {
    return products.map((product) => {
      const category = categories.find((cat) => cat.id === product.category)
      const provider = providers.find((p) => p.id === product.provider)
      const measureUnit = measureUnits.find((mu) => mu.key === product.measurement_unit)
      return {
        ...product,
        categoryName: category ? category.description : 'Sin categoría',
        categoryColor: category ? category.color : 'bg-gray-300',
        providerName: provider ? provider.name : 'Sin proveedor',
        measureUnit: measureUnit ? measureUnit.name : 'Sin unidad de medida'
      }
    })
  }
)
