'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isUuid } from '@/lib/encomiendas-data'
import { GUIDE_STATUSES } from '@/lib/encomiendas'
import { ValidationError, amount, type FormState } from '@/lib/form-utils'

const PATH = '/encomiendas/guias-zoom'
const MAX_GUIDES = 20
const GUIDE_NUMBER = /^[A-Z0-9][A-Z0-9-]{2,39}$/

type DbError = { message: string; code?: string; details?: string; hint?: string }

function dbFailure(table: string, operation: string, error: DbError) {
  const { message, code, details, hint } = error
  console.error('[guias-zoom] Error de base de datos', { table, operation, message, code, details, hint })
  if (code === '23505') {
    return { error: `Ese número de guía ZOOM ya está registrado. (${message}; ${operation}; public.${table})` }
  }
  return { error: `Error guardando guía ZOOM: ${message}${code ? ` [${code}]` : ''} (${operation}; public.${table})` }
}

async function requireUser() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase no está conectado.' } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Tu sesión expiró. Inicia sesión nuevamente.' } as const
  return { supabase, user } as const
}

type Supabase = Exclude<Awaited<ReturnType<typeof requireUser>>, { error: string }>['supabase']

function guideNumber(raw: unknown) {
  const value = String(raw ?? '').trim().toUpperCase()
  if (!value) throw new ValidationError('El número de guía ZOOM es obligatorio.')
  if (!GUIDE_NUMBER.test(value)) {
    throw new ValidationError(`"${value}" no es un número de guía válido. Usa solo letras, números o guiones (3 a 40).`)
  }
  return value
}

function guideStatus(raw: unknown) {
  const value = String(raw ?? '') || 'Asignada'
  if (!(GUIDE_STATUSES as readonly string[]).includes(value)) {
    throw new ValidationError('El estado de la guía no es válido.')
  }
  return value
}

function packageNumber(raw: unknown, packages: number) {
  const value = String(raw ?? '').trim()
  if (!value) return null
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > packages) {
    throw new ValidationError(`El paquete debe estar entre 1 y ${packages}, o asignarse a toda la encomienda.`)
  }
  return n
}

async function loadShipment(supabase: Supabase, id: string) {
  const { data, error } = await supabase
    .from('encomiendas')
    .select('id, cantidad_paquetes')
    .eq('id', id)
    .maybeSingle()
  if (error) return { error: dbFailure('encomiendas', 'SELECT', error).error } as const
  if (!data) return { error: 'La encomienda no existe o no tienes acceso a ella.' } as const
  return { packages: Math.max(1, Number(data.cantidad_paquetes) || 1) } as const
}

export async function assignGuides(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireUser()
  if ('error' in auth) return { error: auth.error ?? null }
  const { supabase, user } = auth

  const encomiendaId = String(formData.get('encomienda_id') ?? '')
  if (!isUuid(encomiendaId)) return { error: 'Selecciona una encomienda.' }

  const shipment = await loadShipment(supabase, encomiendaId)
  if ('error' in shipment) return { error: shipment.error ?? null }

  const numbers = formData.getAll('numero_guia')
  if (numbers.length === 0) return { error: 'Agrega al menos una guía ZOOM.' }
  if (numbers.length > MAX_GUIDES) return { error: `Puedes asignar hasta ${MAX_GUIDES} guías a la vez.` }
  const weights = formData.getAll('peso')
  const parcels = formData.getAll('paquete_numero')
  const statuses = formData.getAll('estado')

  let rows
  try {
    rows = numbers.map((raw, i) => ({
      encomienda_id: encomiendaId,
      user_id: user.id,
      numero_guia: guideNumber(raw),
      peso: amount(weights[i], `Peso de la guía ${i + 1}`),
      paquete_numero: packageNumber(parcels[i], shipment.packages),
      estado: guideStatus(statuses[i]),
    }))
  } catch (e) {
    if (e instanceof ValidationError) return { error: e.message }
    throw e
  }

  const unique = new Set(rows.map((r) => r.numero_guia))
  if (unique.size !== rows.length) return { error: 'Hay números de guía repetidos en el formulario.' }

  const { error } = await supabase.from('encomienda_guias').insert(rows)
  if (error) return dbFailure('encomienda_guias', 'INSERT', error)

  revalidatePath(PATH)
  redirect(`${PATH}?asignada=${encomiendaId}`)
}

export async function updateGuide(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireUser()
  if ('error' in auth) return { error: auth.error ?? null }
  const { supabase } = auth

  const id = String(formData.get('id') ?? '')
  if (!isUuid(id)) return { error: 'La guía no es válida.' }

  const { data: current, error: readError } = await supabase
    .from('encomienda_guias')
    .select('encomienda_id')
    .eq('id', id)
    .maybeSingle()
  if (readError) return dbFailure('encomienda_guias', 'SELECT', readError)
  if (!current) return { error: 'La guía no existe o no tienes acceso a ella.' }

  const shipment = await loadShipment(supabase, current.encomienda_id)
  if ('error' in shipment) return { error: shipment.error ?? null }

  let changes
  try {
    changes = {
      numero_guia: guideNumber(formData.get('numero_guia')),
      peso: amount(formData.get('peso'), 'Peso'),
      paquete_numero: packageNumber(formData.get('paquete_numero'), shipment.packages),
      estado: guideStatus(formData.get('estado')),
    }
  } catch (e) {
    if (e instanceof ValidationError) return { error: e.message }
    throw e
  }

  const { data, error } = await supabase.from('encomienda_guias').update(changes).eq('id', id).select('id')
  if (error) return dbFailure('encomienda_guias', 'UPDATE', error)
  if (!data?.length) return { error: 'No se pudo actualizar la guía: sin permiso de edición (UPDATE; public.encomienda_guias).' }

  revalidatePath(PATH)
  redirect(`${PATH}?asignada=${current.encomienda_id}`)
}

export async function changeGuideStatus(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireUser()
  if ('error' in auth) return { error: auth.error ?? null }
  const { supabase } = auth

  const id = String(formData.get('id') ?? '')
  if (!isUuid(id)) return { error: 'La guía no es válida.' }
  let estado
  try {
    estado = guideStatus(formData.get('estado'))
  } catch (e) {
    if (e instanceof ValidationError) return { error: e.message }
    throw e
  }

  const { data, error } = await supabase.from('encomienda_guias').update({ estado }).eq('id', id).select('id')
  if (error) return dbFailure('encomienda_guias', 'UPDATE', error)
  if (!data?.length) return { error: 'No se pudo cambiar el estado: sin permiso de edición (UPDATE; public.encomienda_guias).' }

  revalidatePath(PATH)
  return { error: null }
}
