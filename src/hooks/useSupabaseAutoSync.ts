import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { AppDispatch, RootState } from '../store'
import { clearUser, setUser } from '../store/slices/authSlice'

export function useSupabaseAuthSync() {
  const dispatch = useDispatch<AppDispatch>()
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Actualizar estado solo si es otro usuario distinto
        if (session.user.id !== currentUserId) {
          dispatch(
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              full_name: '', // si tienes info local, ponla, o llama un thunk para perfil
              phone: '',
              role: 'staff' // o lo que corresponda
            })
          )
        }
      } else {
        dispatch(clearUser())
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [dispatch, currentUserId])
}
