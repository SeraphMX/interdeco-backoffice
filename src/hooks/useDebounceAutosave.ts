// hooks/useDebouncedAutoSave.ts
import { debounce, isEqual, omit } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { quoteService } from '../services/quoteService'
import { RootState } from '../store'
import { setQuote } from '../store/slices/quoteSlice'
import { Quote } from '../types'

export function useDebouncedAutoSave(quote: Quote, delay = 1000) {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const previousQuoteRef = useRef<Quote | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const isFirstRun = useRef(true)
  const ignoreNextEffectRef = useRef(false)

  const save = debounce(async (quoteToSave: Quote) => {
    if (!quoteToSave?.id) return

    const stripVolatileFields = (q: Quote) => {
      return omit(q, ['last_updated', 'access_token', 'status'])
    }

    if (isEqual(stripVolatileFields(quoteToSave), stripVolatileFields(previousQuoteRef.current || ({} as Quote)))) {
      return
    }

    console.log('Autoguardando cotización: ', quoteToSave)

    setIsSaving(true)
    setIsSaved(false)

    const result = await quoteService.updateQuote(quoteToSave, user?.id)

    ignoreNextEffectRef.current = true
    dispatch(setQuote({ ...quoteToSave, last_updated: result.quote?.last_updated, total: result.quote?.total ?? 0 }))

    setIsSaving(false)

    if (result.success) {
      previousQuoteRef.current = quoteToSave
      setIsSaved(true)
    } else {
      console.warn('Error al autoguardar cotización:', result.error)
    }
  }, delay)

  useEffect(() => {
    if (quote?.id && !previousQuoteRef.current) {
      previousQuoteRef.current = quote
    }
  }, [quote])

  useEffect(() => {
    // Si no hay quote o no tiene id, no hacemos nada
    if (!quote || !quote.id) return

    if (ignoreNextEffectRef.current) {
      ignoreNextEffectRef.current = false
      return
    }

    // Espera hasta que el quote tenga items cargados y ref inicializado
    if (isFirstRun.current) {
      // Si es la primera ejecución, no guardamos inmediatamente
      if (quote.id && !quote.created_at) {
        setIsSaved(true)
      }

      if (quote.items && quote.items.length > 0) {
        previousQuoteRef.current = quote
        isFirstRun.current = false
      }

      return
    }

    if (previousQuoteRef.current?.items !== quote.items) {
      setIsSaved(false)
    }

    save(quote)
  }, [quote, save])

  useEffect(() => {
    return () => {
      save.cancel()
    }
  }, [save])

  const isDirty = useMemo(() => {
    return !isEqual(quote, previousQuoteRef.current)
  }, [quote])

  return { isSaving, isSaved, isDirty }
}
