import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
const DEFAULT_LOCALE = 'es-MX'
const DEFAULT_TIMEZONE = 'America/Mexico_City'

type FormatStyle = 'short' | 'long' | 'fullDay'

interface FormatDateOptions {
  style?: FormatStyle
  locale?: string
  timeZone?: string
  customOptions?: Intl.DateTimeFormatOptions
}

export function formatDate(input: string | Date, options: FormatDateOptions = {}): string {
  const { style = 'long', locale = DEFAULT_LOCALE, timeZone = DEFAULT_TIMEZONE, customOptions = {} } = options

  let date: Date
  if (typeof input === 'string') {
    const safeISO = input.endsWith('Z') ? input : input + 'Z'
    date = parseISO(safeISO)
  } else {
    date = input
  }

  const baseOptions: Intl.DateTimeFormatOptions =
    style === 'long'
      ? {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone
        }
      : style === 'fullDay'
      ? {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone
        }
      : {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone
        }

  const finalOptions = { ...baseOptions, ...customOptions }

  return new Intl.DateTimeFormat(locale, finalOptions).format(date)
}

/**
 * Convierte una fecha ISO a formato relativo tipo: "hace 2 horas"
 */
export function parseISOtoRelative(input: string | Date): string {
  let date: Date

  if (typeof input === 'string') {
    // Si no tiene 'Z', lo agregamos para forzar interpretación como UTC
    const safeISO = input.endsWith('Z') ? input : input + 'Z'
    date = parseISO(safeISO)
  } else {
    date = input
  }

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: es
  })
}
