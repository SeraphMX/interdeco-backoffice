import { addToast } from '@heroui/react'
import { supabase } from '../lib/supabase'
import { Category, MeasureUnit, Provider } from '../schemas/catalog.schema'
import { Product } from '../types'

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from('product_details_view').select('*')
      if (error) throw error
      console.log('Data products:', data)
      return data ?? []
    } catch (err) {
      console.error('Error:', err)
      return []
    }
  },

  async createProduct(product: Product): Promise<Product | null> {
    try {
      const { data: newProduct, error } = await supabase.from('products').insert(product).select().single()
      if (error) throw error

      addToast({
        title: 'Producto agregado',
        description: 'El producto se ha guardado correctamente.',
        color: 'success'
        //shouldShowTimeoutProgress: true
      })

      return newProduct
    } catch (err) {
      addToast({
        title: 'Error al guardar',
        description: 'Hubo un error al guardar el producto. Inténtalo de nuevo.',
        color: 'danger'
      })

      console.error('Error:', err)

      return null
    }
  },

  async updateProduct(product: Product): Promise<Product | null> {
    try {
      console.log('Datos a guardar:', product)

      const { data: updatedProduct, error } = await supabase.from('products').update(product).eq('id', product.id).select().single()
      if (error) throw error

      return updatedProduct
    } catch (err) {
      console.error('Error al actualizar el producto:', err)
      return null
    }
  },

  async deleteProduct(product: Product): Promise<void> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id)

      if (error) throw error

      setTimeout(() => {
        addToast({
          title: 'Producto eliminado',
          description: `El producto se borrado correctamente.`,
          color: 'danger'
        })
      }, 1000)
    } catch (err) {
      addToast({
        title: 'Error al eliminar',
        description: 'Hubo un error al eliminar el producto. Inténtalo de nuevo.',
        color: 'danger'
      })

      console.error('Error:', err)
    }
  },
  async setActiveProduct(product: Product, status: boolean): Promise<void> {
    try {
      const { error } = await supabase.from('products').update({ is_active: status }).eq('id', product.id)

      if (error) throw error

      if (status) {
        addToast({
          title: 'Producto activado',
          description: `El producto ${product.spec} se ha activado correctamente.`,
          color: 'primary'
        })
      } else {
        addToast({
          title: 'Producto desactivado',
          description: `El producto ${product.spec} se ha desactivado correctamente.`,
          color: 'primary'
        })
      }
    } catch (err) {
      addToast({
        title: 'Error al actualizar',
        description: 'Hubo un error al actualizar el producto. Inténtalo de nuevo.',
        color: 'danger'
      })

      console.error('Error:', err)
    }
  },
  async addCatalogItem(
    type: 'provider' | 'category' | 'measureUnit',
    item: Provider | Category | MeasureUnit
  ): Promise<Provider | Category | MeasureUnit | null> {
    try {
      let tableName: string
      let data: Provider | Category | MeasureUnit
      let itemName: string

      switch (type) {
        case 'provider':
          itemName = 'Proveedor'
          tableName = 'providers'
          data = { name: (item as Provider).name }
          break
        case 'category':
          itemName = 'Categoría'
          tableName = 'categories'
          data = { description: (item as Category).description, color: (item as Category).color }
          break
        case 'measureUnit':
          itemName = 'Unidad de medida'
          tableName = 'measure_units'
          data = { key: (item as MeasureUnit).key, name: (item as MeasureUnit).name, plural: (item as MeasureUnit).plural }
          break
        default:
          throw new Error('Tipo de catálogo no reconocido')
      }

      const { data: newItem, error } = await supabase.from(tableName).insert(data).select().single()
      if (error) throw error

      addToast({
        title: `${itemName} ${itemName === 'Proveedor' ? 'agregado' : 'agregada'}`,
        description: `${itemName === 'Proveedor' ? 'El' : 'La'} ${itemName.toLowerCase()}  se ha guardado correctamente.`,
        color: 'primary'
      })

      return newItem
    } catch (err) {
      addToast({
        title: 'Error al guardar',
        description: 'Hubo un error al guardar el ítem. Inténtalo de nuevo.',
        color: 'danger'
      })

      console.error('Error:', err)
      return null
    }
  },
  async deleteCatalogItem(type: 'provider' | 'category' | 'measureUnit', item: Provider | Category | MeasureUnit | null): Promise<void> {
    if (!item) return
    try {
      let tableName: string
      let itemId: number | string | undefined
      let itemName: string

      console.log('tipo:', type, 'item:', item)

      switch (type) {
        case 'provider':
          itemName = 'Proveedor'
          tableName = 'providers'
          itemId = (item as Provider).id
          break
        case 'category':
          itemName = 'Categoría'
          tableName = 'categories'
          itemId = (item as Category).id
          break
        case 'measureUnit':
          itemName = 'Unidad de medida'
          tableName = 'measure_units'
          itemId = (item as MeasureUnit).key
          break
        default:
          throw new Error('Tipo de catálogo no reconocido')
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(type === 'measureUnit' ? 'key' : 'id', itemId)
      if (error) throw error

      addToast({
        title: `${itemName} ${itemName === 'Proveedor' ? 'eliminado' : 'eliminada'}`,
        description: `${itemName === 'Proveedor' ? 'El' : 'La'} ${itemName.toLowerCase()} se ha eliminado correctamente.`,
        color: 'primary'
      })
    } catch (err) {
      addToast({
        title: 'Error al eliminar',
        description: 'Hubo un error al eliminar el ítem. Inténtalo de nuevo.',
        color: 'danger'
      })

      console.error('Error:', err)
    }
  },
  async updateCatalogItem(
    type: 'provider' | 'category' | 'measureUnit',
    item: Provider | Category | MeasureUnit
  ): Promise<Provider | Category | MeasureUnit | null> {
    try {
      let tableName: string
      let data: Provider | Category | MeasureUnit
      let itemId: number | string | undefined
      let itemName: string

      console.log('tipo:', type, 'item:', item)

      switch (type) {
        case 'provider':
          itemName = 'Proveedor'
          tableName = 'providers'
          data = { name: (item as Provider).name }
          itemId = (item as Provider).id
          break
        case 'category':
          itemName = 'Categoría'
          tableName = 'categories'
          data = { description: (item as Category).description, color: (item as Category).color }
          itemId = (item as Category).id
          break
        case 'measureUnit':
          itemName = 'Unidad de medida'
          tableName = 'measure_units'
          data = { key: (item as MeasureUnit).key, name: (item as MeasureUnit).name, plural: (item as MeasureUnit).plural }
          itemId = (item as MeasureUnit).key
          break
        default:
          throw new Error('Tipo de catálogo no reconocido')
      }

      const { data: updatedItem, error } = await supabase
        .from(tableName)
        .update(data)
        .eq(type === 'measureUnit' ? 'key' : 'id', itemId)
        .select()
        .single()
      if (error) throw error

      addToast({
        title: `${itemName} ${itemName === 'Proveedor' ? 'actualizado' : 'actualizada'} `,
        description: `${itemName === 'Proveedor' ? 'El' : 'La'} ${itemName.toLowerCase()} se ha actualizado correctamente.`,
        color: 'primary'
      })

      return updatedItem
    } catch (err) {
      addToast({
        title: 'Error al actualizar',
        description: 'Hubo un error al actualizar el ítem. Inténtalo de nuevo.',
        color: 'danger'
      })

      console.error('Error:', err)
      return null
    }
  }
}
