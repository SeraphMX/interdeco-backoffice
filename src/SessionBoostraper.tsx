import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSupabaseAuthSync } from './hooks/useSupabaseAutoSync'
import { AppDispatch } from './store'
import { restoreSession } from './store/slices/authSlice'

export const SessionBootstrapper = ({ onReady }: { onReady: () => void }) => {
  const dispatch = useDispatch<AppDispatch>()
  useSupabaseAuthSync()

  useEffect(() => {
    dispatch(restoreSession()).finally(() => {
      onReady()
    })
  }, [dispatch, onReady]) // ✅ solo se ejecuta una vez al montar

  return null
}
