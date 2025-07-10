import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { User } from '../schemas/user.schema'
import { AppDispatch } from '../store'
import { logoutUser, updateUser } from '../store/slices/authSlice'

export function useSessionGuard() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const setup = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      if (error || !user) return

      channel = supabase
        .channel(`realtime:user-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            const newData = payload.new

            dispatch(updateUser(newData as User))

            if (newData.is_active === false) {
              dispatch(
                logoutUser({
                  type: 'user_banned_live',
                  message: 'Esta cuenta ya no puede iniciar sesión.'
                })
              )
            }
          }
        )
        .subscribe()
    }

    setup()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])
}
