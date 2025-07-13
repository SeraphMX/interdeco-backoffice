const DEFAULT_LOCALE = 'es-MX'
const DEFAULT_CURRENCY = 'MXN'

export type FormatStyle = 'short' | 'long'

export function formatCurrency(
  amount: number,
  style: FormatStyle = 'long',
  locale = DEFAULT_LOCALE,
  currency = DEFAULT_CURRENCY,
  customOptions?: Intl.NumberFormatOptions
): string {
  const baseOptions: Intl.NumberFormatOptions =
    style === 'long'
      ? {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      : {
          style: 'currency',
          currency,
          currencyDisplay: 'narrowSymbol',
          compactDisplay: 'short',
          notation: 'compact', // → Muestra "1.2 M" en vez de "1,200,000"
          minimumFractionDigits: 0,
          maximumFractionDigits: 1
        }

  const finalOptions = { ...baseOptions, ...customOptions }

  return new Intl.NumberFormat(locale, finalOptions).format(amount)
}
