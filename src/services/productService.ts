import { addToast } from '@heroui/react'
import { supabase } from '../lib/supabase'
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
  }
}
