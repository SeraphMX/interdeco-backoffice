import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Quote from '../components/quotes/Quote'
import { quoteService } from '../services/quoteService'
import { RootState } from '../store'
import { clearQuote, setItemsLoaded, setPublicAccess, setQuote } from '../store/slices/quoteSlice'

const Cotizacion = () => {
  const { token } = useParams()
  const dispatch = useDispatch()
  const rxQuote = useSelector((state: RootState) => state.quote)
  const { user } = useSelector((state: RootState) => state.auth)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    dispatch(clearQuote())
    dispatch(setItemsLoaded(false))
    dispatch(setPublicAccess(true))

    const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || 'http://localhost:8888'

    // if (!token) {
    //   setError('Token no proporcionado')
    //   return
    // }

    const verify = async () => {
      try {
        const res = await fetch(`${baseUrl}/.netlify/functions/verify-quote-token?token=${token}`)

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text)
        }

        const data = await res.json()

        console.log('Cotización verificada desde el servidor:', data)

        console.log(data)

        dispatch(setQuote(data.quote))

        if (!user) {
          quoteService.logQuoteAction(data.quote, 'opened')
        }
      } catch (err) {
        setError((err as Error).message)
      }
    }

    verify()
  }, [token, dispatch, user])

  if (error) return <div className='p-4 text-red-600'>Error: {error}</div>

  if (!rxQuote) return <div className='p-4'>Cargando cotización...</div>

  return (
    <div className='container  space-y-4  h-full flex flex-col'>
      <Quote />
    </div>
  )
}

export default Cotizacion
