// src/hooks/useCategories.ts
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { User } from '../schemas/user.schema'
import { addUser, removeUser, setUsers, updateUser } from '../store/slices/usersSlice'

export const useUsers = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Carga inicial
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('user_profiles').select('*')
      if (data) dispatch(setUsers(data))
      if (error) console.error('Error al cargar los usuarios:', error.message)
    }

    fetchUsers()

    // Realtime
    const channel = supabase
      .channel('realtime:Users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, (payload) => {
        const { eventType, new: newData, old: oldData } = payload
        if (eventType === 'INSERT') dispatch(addUser(newData as User))
        if (eventType === 'UPDATE') dispatch(updateUser(newData as User))
        if (eventType === 'DELETE') dispatch(removeUser(oldData.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dispatch])
}
