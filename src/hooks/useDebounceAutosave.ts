// hooks/useDebouncedAutoSave.ts
import { debounce, isEqual } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { quoteService } from '../services/quoteService'
import { Quote } from '../types'

export function useDebouncedAutoSave(quote: Quote, delay = 1000) {
  const previousQuoteRef = useRef<Quote | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const isFirstRun = useRef(true)

  const save = debounce(async (quoteToSave: Quote) => {
    if (!quoteToSave?.id) return

    if (isEqual(quoteToSave, previousQuoteRef.current)) return

    console.log('Autoguardando cotización: ', quoteToSave)

    setIsSaving(true)
    setIsSaved(false)

    const result = await quoteService.updateQuote(quoteToSave)
    setIsSaving(false)

    if (result.success) {
      previousQuoteRef.current = quoteToSave
      setIsSaved(true)

      // Opcional: ocultar el mensaje de guardado después de 2 segundos
      //setTimeout(() => setIsSaved(false), 2000)
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
    if (!quote || !quote.id) return

    // Espera hasta que el quote tenga items cargados y ref inicializado
    if (isFirstRun.current) {
      if (quote.items && quote.items.length > 0) {
        previousQuoteRef.current = quote
        isFirstRun.current = false
      }
      return
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
