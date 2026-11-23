'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isUuid } from '@/lib/encomiendas-data'
import { VENEZUELA_STATES } from '@/lib/encomiendas'
import { ValidationError, type FormState } from '@/lib/form-utils'

const PATH = '/encomiendas/agencias-zoom'
const MAX_IMPORT_ROWS = 2000

async function requireUser() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase no está conectado.' } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Tu sesión expiró. Inicia sesión nuevamente.' } as const
  return { supabase }
}

const clean = (v: unknown) => String(v ?? '').trim().replace(/\s+/g, ' ')

function normalizeState(raw: string) {
  const match = VENEZUELA_STATES.find((s) => s.localeCompare(raw, 'es', { sensitivity: 'base' }) === 0)
  if (!match) throw new ValidationError(`"${raw}" no es un estado de Venezuela válido.`)
  return match
}

function agencyFields(values: { estado: unknown; ciudad: unknown; nombre_agencia: unknown; direccion?: unknown }) {
  const estado = clean(values.estado)
  const ciudad = clean(values.ciudad)
  const nombre = clean(values.nombre_agencia)
  const direccion = clean(values.direccion)
  if (!estado) throw new ValidationError('El estado es obligatorio.')
  if (!ciudad) throw new ValidationError('La ciudad es obligatoria.')
  if (!nombre) throw new ValidationError('El nombre de la agencia es obligatorio.')
  if (ciudad.length > 80 || nombre.length > 150 || direccion.length > 300) {
    throw new ValidationError('Uno de los campos supera la longitud permitida.')
  }
  return { estado: normalizeState(estado), ciudad, nombre_agencia: nombre, direccion: direccion || null }
}

const duplicateMessage = 'Ya existe una agencia con ese estado, ciudad y nombre.'

export async function saveZoomAgency(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireUser()
  if ('error' in auth) return { error: auth.error ?? null }
  const id = clean(formData.get('id'))
  if (id && !isUuid(id)) return { error: 'La agencia no es válida.' }

  let fields
  try {
    fields = agencyFields({
      estado: formData.get('estado'),
      ciudad: formData.get('ciudad'),
      nombre_agencia: formData.get('nombre_agencia'),
      direccion: formData.get('direccion'),
    })
  } catch (e) {
    if (e instanceof ValidationError) return { error: e.message }
    throw e
  }
  const active = formData.get('active') === 'on'

  const { error } = id
    ? await auth.supabase.from('zoom_agencias').update({ ...fields, active }).eq('id', id)
    : await auth.supabase.from('zoom_agencias').insert({ ...fields, active })
  if (error) return { error: error.code === '23505' ? duplicateMessage : 'No se pudo guardar la agencia.' }

  revalidatePath(PATH)
  redirect(`${PATH}?guardada=1`)
}

export async function toggleZoomAgency(formData: FormData) {
  const auth = await requireUser()
  if ('error' in auth) return
  const id = clean(formData.get('id'))
  if (!isUuid(id)) return
  const active = formData.get('active') === 'true'
  await auth.supabase.from('zoom_agencias').update({ active }).eq('id', id)
  revalidatePath(PATH)
}

function parseDelimited(raw: string) {
  const rows = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (rows.length === 0) throw new ValidationError('Pega al menos una fila.')
  const delimiter = rows[0].includes('\t') ? '\t' : rows[0].includes(';') ? ';' : ','
  const split = (line: string) => line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''))
  const first = split(rows[0]).map((c) => c.toLowerCase())
  const hasHeader = first.includes('estado') && first.includes('ciudad')
  const body = hasHeader ? rows.slice(1) : rows
  if (body.length > MAX_IMPORT_ROWS) throw new ValidationError(`Máximo ${MAX_IMPORT_ROWS} filas por importación.`)
  return body.map((line, i) => {
    const [estado, ciudad, nombre_agencia, ...rest] = split(line)
    try {
      return agencyFields({ estado, ciudad, nombre_agencia, direccion: rest.join(delimiter === '\t' ? ' ' : `${delimiter} `) })
    } catch (e) {
      if (e instanceof ValidationError) throw new ValidationError(`Fila ${i + 1 + (hasHeader ? 1 : 0)}: ${e.message}`)
      throw e
    }
  })
}

const keyOf = (a: { estado: string; ciudad: string; nombre_agencia: string }) =>
  [a.estado, a.ciudad, a.nombre_agencia].map((v) => v.toLocaleLowerCase('es')).join('|')

export async function importZoomAgencies(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireUser()
  if ('error' in auth) return { error: auth.error ?? null }

  let parsed
  try {
    parsed = parseDelimited(String(formData.get('datos') ?? ''))
  } catch (e) {
    if (e instanceof ValidationError) return { error: e.message }
    throw e
  }

  const { data: existing, error: loadError } = await auth.supabase
    .from('zoom_agencias')
    .select('estado, ciudad, nombre_agencia')
    .limit(10000)
  if (loadError) return { error: 'No se pudo leer el catálogo actual. Verifica que la migración 003 esté aplicada.' }

  const seen = new Set((existing ?? []).map(keyOf))
  const fresh = parsed.filter((a) => {
    const k = keyOf(a)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  if (fresh.length) {
    const { error } = await auth.supabase.from('zoom_agencias').insert(fresh.map((a) => ({ ...a, active: true })))
    if (error) return { error: error.code === '23505' ? duplicateMessage : 'No se pudo importar el catálogo.' }
  }

  revalidatePath(PATH)
  redirect(`${PATH}?importadas=${fresh.length}&omitidas=${parsed.length - fresh.length}`)
}
