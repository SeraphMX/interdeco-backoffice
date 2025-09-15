// netlify/functions/backfill-quote-expiration.ts
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const JWT_SECRET = process.env.JWT_SECRET!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

/**
 * Procesa un bloque de filas a partir del último ID visto.
 * No cambia expiration_date si el token no tiene exp o no es verificable.
 */
async function processChunk(lastId: number, limit: number) {
  const { data: rows, error } = await supabase
    .from('quotes')
    .select('id, access_token, expiration_date')
    .not('access_token', 'is', null)
    .gt('id', lastId)
    .order('id', { ascending: true })
    .limit(limit)

  if (error) throw error
  if (!rows?.length) return { processed: 0, lastId }

  let updates = 0
  for (const row of rows) {
    const token = row.access_token as string
    let expSec: number | undefined

    try {
      // Ignoramos expiración para poder leer exp de tokens vencidos también
      const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as { exp?: number }
      expSec = decoded.exp
    } catch {
      // Firma inválida / token corrupto → no tocamos expiration_date
      lastId = row.id
      continue
    }

    if (typeof expSec === 'number' && !Number.isNaN(expSec)) {
      const expiresAt = new Date(expSec * 1000)
      // Solo actualiza si es diferente (evita escrituras innecesarias)
      const needsUpdate = !row.expiration_date || new Date(row.expiration_date).getTime() !== expiresAt.getTime()

      if (needsUpdate) {
        const { error: upErr } = await supabase.from('quotes').update({ expiration_date: expiresAt.toISOString() }).eq('id', row.id)

        if (!upErr) updates++
      }
    }
    lastId = row.id
  }

  return { processed: rows.length, updated: updates, lastId }
}

export const handler: Handler = async () => {
  try {
    const BATCH = 500
    let lastId = 0
    let totalProcessed = 0
    let totalUpdated = 0

    // Itera varios bloques por invocación (ajusta si tu límite de tiempo es bajo)
    for (let i = 0; i < 20; i++) {
      const { processed, updated, lastId: nextLastId } = await processChunk(lastId, BATCH)
      totalProcessed += processed
      totalUpdated += updated ?? 0
      lastId = nextLastId
      if (processed < BATCH) break // ya no hay más
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, processed: totalProcessed, updated: totalUpdated, lastId })
    }
  } catch (e: any) {
    return { statusCode: 500, body: e?.message ?? 'Error' }
  }
}
