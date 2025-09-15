// src/utils/expiration.ts

import { Quote, QuoteStatus } from '../types'

export type ExpireState = 'upcoming' | 'today' | 'expired' | 'none'

const MS_PER_DAY = 86_400_000
const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export interface ExpireInfo {
  state: ExpireState
  /** días firmados (negativo si ya expiró, 0 si hoy, >0 si futuro) */
  daysSigned?: number
  /** solo por compat: no negativo */
  daysToExpire?: number
  /** si expiró: cuántos días han pasado */
  expiredDaysAgo?: number
}

/** Calcula estado de expiración con días de calendario (evita 10→11) */
export function getExpireInfo(expirationDate?: string | null, now: Date = new Date()): ExpireInfo {
  if (!expirationDate) return { state: 'none' }
  const nowStart = startOfDay(now)
  const expStart = startOfDay(new Date(expirationDate))
  const diff = Math.round((expStart.getTime() - nowStart.getTime()) / MS_PER_DAY)

  if (diff < 0) return { state: 'expired', daysSigned: diff, daysToExpire: 0, expiredDaysAgo: Math.abs(diff) }
  if (diff === 0) return { state: 'today', daysSigned: 0, daysToExpire: 0 }
  return { state: 'upcoming', daysSigned: diff, daysToExpire: diff }
}

/** Texto estándar para chips/labels */
export function getExpireLabel(info: ExpireInfo): string {
  if (info.state === 'expired') {
    const n = info.expiredDaysAgo ?? Math.abs(info.daysSigned ?? 0)
    return `Expiró hace ${n} día${n === 1 ? '' : 's'}`
  }
  if (info.state === 'today') return 'Expira hoy'
  const n = info.daysSigned ?? info.daysToExpire ?? 0
  return `Expira en ${n} día${n === 1 ? '' : 's'}`
}

/** Map a colores de UI (ajusta a tu paleta si quieres) */
export function getExpireChipColor(info: ExpireInfo): 'default' | 'warning' | 'danger' {
  if (info.state === 'expired') return 'danger'
  if (info.state === 'today') return 'warning'
  if (info.state === 'upcoming') return 'warning'
  return 'default'
}

/** Helper para asegurar expiration_date string (no null) */
export function hasExpiration(q: Quote): q is Quote & { expiration_date: string } {
  return typeof q.expiration_date === 'string' && q.expiration_date.length > 0
}

/**
 * Top N próximas a expirar (incluye hoy), y si faltan, rellena con expiradas recientes.
 * Por defecto incluye estados: open, opened, sent.
 */
export function selectExpiringQuotes(
  quotes: Quote[],
  opts?: { count?: number; allowedStatuses?: QuoteStatus[]; now?: Date }
): (Quote & { daysToExpire?: number; expireInfo: ExpireInfo })[] {
  const count = opts?.count ?? 10
  const now = opts?.now ?? new Date()
  const allowed = new Set<QuoteStatus>(opts?.allowedStatuses ?? (['open', 'opened', 'sent'] as QuoteStatus[]))

  const withDate = quotes.filter((q) => hasExpiration(q) && allowed.has(q.status))

  const decorated = withDate.map((q) => {
    const expireInfo = getExpireInfo(q.expiration_date, now)
    return { ...q, daysToExpire: expireInfo.daysToExpire, expireInfo }
  })

  const upcoming = decorated
    .filter((q) => q.expireInfo.state === 'upcoming' || q.expireInfo.state === 'today')
    .sort((a, b) => new Date(a.expiration_date!).getTime() - new Date(b.expiration_date!).getTime())

  const expired = decorated
    .filter((q) => q.expireInfo.state === 'expired' || q.status === 'expired')
    .sort((a, b) => new Date(b.expiration_date!).getTime() - new Date(a.expiration_date!).getTime())

  const result: typeof decorated = [...upcoming.slice(0, count)]
  if (result.length < count) {
    for (const q of expired) {
      if (!result.some((t) => t.id === q.id)) result.push(q)
      if (result.length === count) break
    }
  }
  return result
}
