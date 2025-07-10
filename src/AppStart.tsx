import { useCategories } from './hooks/useCategories'
import { useCustomers } from './hooks/useCustomers'
import { useMeasureUnits } from './hooks/useMeasureUnits'
import { useProducts } from './hooks/useProducts'
import { useProviders } from './hooks/useProviders'
import { useUsers } from './hooks/useUsers'

export const AppStart = () => {
  useCategories() //Carga de categorias desde supabase a redux
  useProviders() //Carga de proveedores desde supabase a redux
  useMeasureUnits() //Carga de unidades de medida desde supabase a redux
  useCustomers() //Carga de clientes desde supabase a redux
  useProducts() //Carga de productos desde supabase a redux
  useUsers() //Carga de usuarios desde supabase a redux
  return null // No renderiza nada
}
