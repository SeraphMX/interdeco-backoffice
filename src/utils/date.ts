import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
const DEFAULT_LOCALE = 'es-MX'
const DEFAULT_TIMEZONE = 'America/Mexico_City'

type FormatStyle = 'short' | 'long'

export function formatDate(
  input: string | Date,
  style: FormatStyle = 'long',
  locale = DEFAULT_LOCALE,
  timeZone = DEFAULT_TIMEZONE,
  customOptions?: Intl.DateTimeFormatOptions
): string {
  const date = typeof input === 'string' ? new Date(input) : input

  // Estilo base según "short" o "long"
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
      : {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone
        }

  // Si mandas opciones personalizadas, las mezcla (sobrescribe lo que necesites)
  const finalOptions = { ...baseOptions, ...customOptions }

  return new Intl.DateTimeFormat(locale, finalOptions).format(date)
}

/**
 * Convierte una fecha ISO a formato relativo tipo: "hace 2 horas"
 */
export function parseISOtoRelative(isoString: string | Date): string {
  const date = typeof isoString === 'string' ? parseISO(isoString) : isoString

  return formatDistanceToNow(date, {
    addSuffix: true, // agrega "hace"
    locale: es
  })
}
