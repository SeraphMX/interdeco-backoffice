import { addToast } from '@heroui/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { Product } from '../types'
import { productService } from './productService'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

vi.mock('@heroui/react', () => ({
  addToast: vi.fn()
}))

describe('productService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('getProducts retorna datos si supabase responde sin error', async () => {
    const mockData = [{ id: 1, name: 'Producto 1' }]
    const selectMock = vi.fn().mockResolvedValue({ data: mockData, error: null })
    const fromMock = vi.fn().mockReturnValue({ select: selectMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    const products = await productService.getProducts()
    expect(products).toEqual(mockData)
  })

  it('createProduct llama a supabase y addToast en éxito', async () => {
    const product: Product = {
      id: 1,
      spec: 'Producto Test',
      sku: 'SKU-123',
      description: 'Mock producto',
      provider: 1,
      category: 1,
      price: 100,
      measurement_unit: 'm2',
      package_unit: 1,
      utility: 10,
      is_active: true
    }
    const singleMock = vi.fn().mockResolvedValue({ data: product, error: null })
    const selectMock = vi.fn().mockReturnValue({ single: singleMock })
    const insertMock = vi.fn().mockReturnValue({ select: selectMock })
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    const result = await productService.createProduct(product)
    expect(result).toEqual(product)
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Producto agregado' }))
  })

  it('createProduct maneja error y muestra toast de error', async () => {
    const product: Product = {
      id: 1,
      spec: 'Producto Test',
      sku: 'SKU-123',
      description: 'Mock producto',
      provider: 1,
      category: 1,
      price: 100,
      measurement_unit: 'm2',
      package_unit: 1,
      utility: 10,
      is_active: true
    }
    const error = new Error('Insert error')
    const singleMock = vi.fn().mockResolvedValue({ data: null, error })
    const selectMock = vi.fn().mockReturnValue({ single: singleMock })
    const insertMock = vi.fn().mockReturnValue({ select: selectMock })
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    const result = await productService.createProduct(product)
    expect(result).toBeNull()
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error al guardar' }))
  })

  it('updateProduct actualiza y retorna producto en éxito', async () => {
    const product: Product = {
      id: 1,
      spec: 'Producto Test',
      sku: 'SKU-123',
      description: 'Mock producto',
      provider: 1,
      category: 1,
      price: 100,
      measurement_unit: 'm2',
      package_unit: 1,
      utility: 10,
      is_active: true
    }
    const singleMock = vi.fn().mockResolvedValue({ data: product, error: null })
    const selectMock = vi.fn().mockReturnValue({ single: singleMock })
    const eqMock = vi.fn().mockReturnValue({ select: selectMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ update: updateMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    const result = await productService.updateProduct(product)
    expect(result).toEqual(product)
  })

  it('updateProduct maneja error y retorna null', async () => {
    const product: Product = {
      id: 1,
      spec: 'Producto Test',
      sku: 'SKU-123',
      description: 'Mock producto',
      provider: 1,
      category: 1,
      price: 100,
      measurement_unit: 'm2',
      package_unit: 1,
      utility: 10,
      is_active: true
    }
    const error = new Error('Update error')
    const singleMock = vi.fn().mockResolvedValue({ data: null, error })
    const selectMock = vi.fn().mockReturnValue({ single: singleMock })
    const eqMock = vi.fn().mockReturnValue({ select: selectMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ update: updateMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    const result = await productService.updateProduct(product)
    expect(result).toBeNull()
  })

  it('deleteProduct elimina producto y muestra toast de éxito', async () => {

    vi.useFakeTimers()

    const product: Product = {
      id: 1,
      spec: 'Producto Test',
      sku: 'SKU-123',
      description: 'Mock producto',
      provider: 1,
      category: 1,
      price: 100,
      measurement_unit: 'm2',
      package_unit: 1,
      utility: 10,
      is_active: true
    }
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ delete: deleteMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    await productService.deleteProduct(product)
    expect(eqMock).toHaveBeenCalled()
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Producto eliminado' }))
  })

  it('deleteProduct maneja error y muestra toast de error', async () => {
    const product: Product = {
      id: 1,
      spec: 'Producto Test',
      sku: 'SKU-123',
      description: 'Mock producto',
      provider: 1,
      category: 1,
      price: 100,
      measurement_unit: 'm2',
      package_unit: 1,
      utility: 10,
      is_active: true
    }
    const error = new Error('Delete error')
    const eqMock = vi.fn().mockResolvedValue({ error })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ delete: deleteMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    await productService.deleteProduct(product)
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error al eliminar' }))
  })

  it('setActiveProduct activa producto y muestra toast correcto', async () => {
    const product: Product = {
      id: 1,
      spec: 'Producto Test',
      sku: 'SKU-123',
      description: 'Mock producto',
      provider: 1,
      category: 1,
      price: 100,
      measurement_unit: 'm2',
      package_unit: 1,
      utility: 10,
      is_active: true
    }
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ update: updateMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    await productService.setActiveProduct(product, true)
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Producto activado' }))
  })

  it('setActiveProduct desactiva producto y muestra toast correcto', async () => {
    const product: Product = {
      id: 1,
      spec: 'Producto Test',
      sku: 'SKU-123',
      description: 'Mock producto',
      provider: 1,
      category: 1,
      price: 100,
      measurement_unit: 'm2',
      package_unit: 1,
      utility: 10,
      is_active: true
    }
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ update: updateMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    await productService.setActiveProduct(product, false)
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Producto desactivado' }))
  })

  it('setActiveProduct maneja error y muestra toast de error', async () => {
    const product: Product = {
      id: 1,
      spec: 'Producto Test',
      sku: 'SKU-123',
      description: 'Mock producto',
      provider: 1,
      category: 1,
      price: 100,
      measurement_unit: 'm2',
      package_unit: 1,
      utility: 10,
      is_active: true
    }
    const error = new Error('Update error')
    const eqMock = vi.fn().mockResolvedValue({ error })
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ update: updateMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    await productService.setActiveProduct(product, true)
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error al actualizar' }))
  })

  it('addCatalogItem agrega item y muestra toast', async () => {
    const newItem = { id: 1, name: 'Proveedor 1' }
    const singleMock = vi.fn().mockResolvedValue({ data: newItem, error: null })
    const selectMock = vi.fn().mockReturnValue({ single: singleMock })
    const insertMock = vi.fn().mockReturnValue({ select: selectMock })
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    const result = await productService.addCatalogItem('provider', { name: 'Proveedor 1' })
    expect(result).toEqual(newItem)
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Proveedor agregado' }))
  })

  it('addCatalogItem maneja error y muestra toast', async () => {
    const error = new Error('Insert error')
    const singleMock = vi.fn().mockResolvedValue({ data: null, error })
    const selectMock = vi.fn().mockReturnValue({ single: singleMock })
    const insertMock = vi.fn().mockReturnValue({ select: selectMock })
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    const result = await productService.addCatalogItem('provider', { name: 'Proveedor' })
    expect(result).toBeNull()
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error al guardar' }))
  })

  it('deleteCatalogItem elimina item y muestra toast', async () => {
    const item = { id: 1, name: 'Proveedor 1' }
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ delete: deleteMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    await productService.deleteCatalogItem('provider', item)
    expect(eqMock).toHaveBeenCalled()
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Proveedor eliminado' }))
  })

  it('deleteCatalogItem maneja error y muestra toast', async () => {
    const item = { id: 1, name: 'Proveedor 1' }
    const error = new Error('Delete error')
    const eqMock = vi.fn().mockResolvedValue({ error })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ delete: deleteMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    await productService.deleteCatalogItem('provider', item)
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error al eliminar' }))
  })

  it('updateCatalogItem actualiza item y muestra toast', async () => {
    const item = { id: 1, name: 'Proveedor 1' }
    const singleMock = vi.fn().mockResolvedValue({ data: item, error: null })
    const selectMock = vi.fn().mockReturnValue({ single: singleMock })
    const eqMock = vi.fn().mockReturnValue({ select: selectMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ update: updateMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    const result = await productService.updateCatalogItem('provider', item)
    expect(result).toEqual(item)
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Proveedor actualizado'
      })
    )
  })

  it('updateCatalogItem maneja error y muestra toast', async () => {
    const item = { id: 1, name: 'Proveedor 1' }
    const error = new Error('Update error')
    const singleMock = vi.fn().mockResolvedValue({ data: null, error })
    const selectMock = vi.fn().mockReturnValue({ single: singleMock })
    const eqMock = vi.fn().mockReturnValue({ select: selectMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
    const fromMock = vi.fn().mockReturnValue({ update: updateMock })
    vi.spyOn(supabase, 'from').mockImplementation(fromMock)

    const result = await productService.updateCatalogItem('provider', item)
    expect(result).toBeNull()
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error al actualizar' }))
  })
})
