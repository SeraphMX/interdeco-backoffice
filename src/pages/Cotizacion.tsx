import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Quote from '../components/quotes/Quote'
import { RootState } from '../store'
import { setPublicAccess, setQuote } from '../store/slices/quoteSlice'

const Cotizacion = () => {
  const { token } = useParams()
  const dispatch = useDispatch()
  const rxQuote = useSelector((state: RootState) => state.quote)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    dispatch(setPublicAccess(true))

    const baseUrl = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || 'http://localhost:8888'

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
        dispatch(setQuote(data.quote))
      } catch (err) {
        setError((err as Error).message)
      }
    }

    verify()
  }, [token, dispatch])

  if (error) return <div className='p-4 text-red-600'>Error: {error}</div>

  if (!rxQuote) return <div className='p-4'>Cargando cotización...</div>

  return (
    <main className='container mx-auto px-4 py-8 flex-grow min-h-screen-minus-navbar'>
      <div className='container  space-y-4  h-full flex flex-col'>
        <Quote />
      </div>
    </main>
  )
}

export default Cotizacion
