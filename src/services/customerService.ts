import { addToast } from '@heroui/react'
import { supabase } from '../lib/supabase'
import { Customer } from '../types'

export const customerService = {
  async getCustomers() {
    try {
      const { data, error } = await supabase.from('customers').select('*')
      if (error) throw error
      return data as Customer[]
    } catch (error) {
      console.error('Error al obtener clientes:', error)
      addToast({
        title: 'Error al cargar clientes',
        description: 'No se pudieron cargar los clientes. Inténtalo de nuevo.',
        color: 'danger'
      })
      return []
    }
  },
  async addCustomer(newCustomer: Customer) {
    try {
      const { error } = await supabase.from('customers').insert([newCustomer]).select().single()
      if (error) throw error

      addToast({
        title: 'Cliente agregado',
        description: 'Los datos del cliente se han guardado.',
        color: 'success'
      })
    } catch (error) {
      console.error('Error al agregar cliente:', error)
      addToast({
        title: 'Error al agregar cliente',
        description: 'Los datos no se pudieron guardar. Inténtalo de nuevo.',
        color: 'danger'
      })
    }
  },
  async updateCustomer(updatedCustomer: Customer) {
    try {
      const { data, error } = await supabase.from('customers').update(updatedCustomer).eq('id', updatedCustomer.id).select().single()
      if (error) throw error

      addToast({
        title: 'Cliente actualizado',
        description: 'Los datos del cliente se han actualizado.',
        color: 'success'
      })

      return data as Customer
    } catch (error) {
      console.error('Error al actualizar cliente:', error)
      addToast({
        title: 'Error al actualizar cliente',
        description: 'Los datos no se pudieron actualizar. Inténtalo de nuevo.',
        color: 'danger'
      })
    }
  },
  async deleteCustomer(deleteCustomer: Customer) {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', deleteCustomer.id)
      if (error) throw error

      addToast({
        title: 'Cliente eliminado',
        description: 'El cliente ha sido eliminado correctamente.',
        color: 'success'
      })
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
      addToast({
        title: 'Error al eliminar cliente',
        description: 'No se pudo eliminar el cliente. Inténtalo de nuevo.',
        color: 'danger'
      })
    }
  }
}
