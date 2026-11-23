'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  GUIDE_STATUSES,
  MAX_CONTENT_LINES,
  MAX_GUIDES,
  MAX_PACKAGES,
  ORIGIN_COUNTRY,
  SHIPMENT_STATUSES,
  billableWeight,
  shipmentTotals,
  volumetricWeight,
} from '@/lib/encomiendas'
import { collectDeclaration } from '@/lib/preregistro-declaration'
import { isUuid } from '@/lib/encomiendas-data'
import { ValidationError, amount, date, oneOf, text, type FormState } from '@/lib/form-utils'

const MAX_TEXT = 500

function limited(formData: FormData, key: string, opts?: { required?: boolean; label?: string }) {
  const value = text(formData, key, opts)
  if (value && value.length > MAX_TEXT) throw new ValidationError(`"${opts?.label ?? key}" es demasiado largo.`)
  return value
}

function envCode(formData?: FormData) {
  const raw = formData && text(formData, 'codigo_env')?.toUpperCase().replace(/\s+/g, '')
  if (raw && !/^[A-Z0-9-]{3,30}$/.test(raw)) {
    throw new ValidationError('El código ENV solo admite letras, números y guiones (3 a 30 caracteres).')
  }
  if (raw) return raw
  const today = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  return `ENV-${today}-${randomBytes(3).toString('hex').toUpperCase()}`
}

function email(formData: FormData, key: string) {
  const value = limited(formData, key, { label: 'Email' })
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new ValidationError('El email del remitente no es válido.')
  return value
}

function parties(formData: FormData) {
  return {
    remitente_nombre: limited(formData, 'remitente_nombre', { required: true, label: 'Nombre del remitente' })!,
    remitente_documento: limited(formData, 'remitente_documento'),
    remitente_telefono: limited(formData, 'remitente_telefono'),
    remitente_direccion: limited(formData, 'remitente_direccion'),
    remitente_ciudad: limited(formData, 'remitente_ciudad'),
    remitente_pais: limited(formData, 'remitente_pais') ?? ORIGIN_COUNTRY,
    remitente_email: email(formData, 'remitente_email'),
    destinatario_nombre: limited(formData, 'destinatario_nombre', { required: true, label: 'Nombre del destinatario' })!,
    destinatario_documento: limited(formData, 'destinatario_documento'),
    destinatario_telefono: limited(formData, 'destinatario_telefono'),
    destinatario_observaciones: limited(formData, 'destinatario_observaciones'),
  }
}

type Supabase = NonNullable<Awaited<ReturnType<typeof createClient>>>

async function destination(supabase: Supabase, formData: FormData, onQueryError?: (error: ShipmentDbError) => never) {
  const agencyId = String(formData.get('agencia_zoom_id') ?? '').trim()
  if (agencyId) {
    if (!isUuid(agencyId)) throw new ValidationError('La agencia ZOOM seleccionada no es válida.')
    const { data: agency, error } = await supabase
      .from('zoom_agencias')
      .select('id, estado, ciudad, nombre_agencia, direccion, active')
      .eq('id', agencyId)
      .maybeSingle()
    if (error) onQueryError?.(error)
    if (!agency || !agency.active) throw new ValidationError('La agencia ZOOM seleccionada no está disponible.')
    return {
      destinatario_estado: agency.estado as string,
      destinatario_ciudad: agency.ciudad as string,
      agencia_zoom_id: agency.id as string,
      agencia_zoom: agency.nombre_agencia as string,
      direccion: (agency.direccion as string | null) ?? null,
    }
  }

  const estado = limited(formData, 'destinatario_estado', { required: true, label: 'Estado del destinatario' })!
  const { count, error } = await supabase
    .from('zoom_agencias')
    .select('id', { count: 'exact', head: true })
    .eq('estado', estado)
    .eq('active', true)
  if (error) onQueryError?.(error)
  if (count) throw new ValidationError('Selecciona la agencia ZOOM de destino del catálogo.')
  return {
    destinatario_estado: estado,
    destinatario_ciudad: limited(formData, 'destinatario_ciudad', { required: true, label: 'Ciudad del destinatario' })!,
    agencia_zoom_id: null,
    agencia_zoom: null,
    direccion: null,
  }
}

function parseJsonList(raw: FormDataEntryValue | null, label: string): Record<string, unknown>[] {
  let list: unknown
  try {
    list = JSON.parse(String(raw ?? '[]'))
  } catch {
    throw new ValidationError(`La lista de ${label} no es válida.`)
  }
  if (!Array.isArray(list)) throw new ValidationError(`La lista de ${label} no es válida.`)
  return list.map((item) => (item && typeof item === 'object' ? (item as Record<string, unknown>) : {}))
}

function parsePackages(raw: FormDataEntryValue | null) {
  const list = parseJsonList(raw, 'paquetes')
  if (list.length === 0) throw new ValidationError('Agrega al menos un paquete.')
  if (list.length > MAX_PACKAGES) throw new ValidationError(`Máximo ${MAX_PACKAGES} paquetes por encomienda.`)

  return list.map((p, i) => {
    const n = i + 1
    const ancho = amount(p.ancho, `Ancho del paquete ${n}`)
    const largo = amount(p.largo, `Largo del paquete ${n}`)
    const alto = amount(p.alto, `Alto del paquete ${n}`)
    const peso_fisico = amount(p.peso, `Peso físico del paquete ${n}`)
    if (peso_fisico === null) throw new ValidationError(`Indica el peso físico del paquete ${n}.`)
    const peso_volumetrico = ancho && largo && alto ? volumetricWeight(ancho, largo, alto) : null
    return {
      numero: n,
      ancho,
      largo,
      alto,
      peso_fisico,
      peso_volumetrico,
      peso_facturable: billableWeight(peso_fisico, peso_volumetrico),
    }
  })
}

function parseContent(raw: FormDataEntryValue | null) {
  const lines = parseJsonList(raw, 'contenido')
    .map((l) => ({
      descripcion: String(l.descripcion ?? '').trim(),
      marca: String(l.marca ?? '').trim(),
      cantidad: l.cantidad,
      valor: l.valor,
    }))
    .filter((l) => l.descripcion)
  if (lines.length > MAX_CONTENT_LINES) throw new ValidationError(`Máximo ${MAX_CONTENT_LINES} líneas de contenido.`)
  return lines.map((l, i) => {
    const n = i + 1
    if (l.descripcion.length > 200) throw new ValidationError(`La descripción de la línea ${n} es demasiado larga.`)
    if (l.marca.length > 80) throw new ValidationError(`La marca de la línea ${n} es demasiado larga.`)
    const cantidad = amount(l.cantidad, `Cantidad de la línea ${n}`)
    if (cantidad !== null && !Number.isInteger(cantidad)) {
      throw new ValidationError(`La cantidad de la línea ${n} debe ser un número entero.`)
    }
    return {
      linea: n,
      descripcion: l.descripcion,
      marca: l.marca || null,
      cantidad,
      valor_usd: amount(l.valor, `Valor USD de la línea ${n}`),
    }
  })
}

function parseGuides(raw: FormDataEntryValue | null, packageCount: number) {
  const guides = parseJsonList(raw, 'guías').filter((g) => String(g.numero_guia ?? '').trim())
  if (guides.length > MAX_GUIDES) throw new ValidationError(`Máximo ${MAX_GUIDES} guías por encomienda.`)
  const seen = new Set<string>()
  return guides.map((g, i) => {
    const n = i + 1
    const numero_guia = String(g.numero_guia).trim().toUpperCase()
    if (!/^[A-Z0-9-]{3,40}$/.test(numero_guia)) throw new ValidationError(`El número de la guía ${n} no es válido.`)
    if (seen.has(numero_guia)) throw new ValidationError(`La guía ${numero_guia} está repetida.`)
    seen.add(numero_guia)
    const estado = String(g.estado ?? 'Asignada')
    if (!(GUIDE_STATUSES as readonly string[]).includes(estado)) {
      throw new ValidationError(`El estado de la guía ${n} no es válido.`)
    }
    const paqueteRaw = String(g.paquete_numero ?? '').trim()
    const paquete_numero = paqueteRaw ? Number(paqueteRaw) : null
    if (paquete_numero !== null && (!Number.isInteger(paquete_numero) || paquete_numero < 1 || paquete_numero > packageCount)) {
      throw new ValidationError(`La guía ${n} está asociada a un paquete que no existe.`)
    }
    return { numero_guia, peso: amount(g.peso, `Peso de la guía ${n}`), estado, paquete_numero }
  })
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

const isUniqueViolation = (error: { code?: string } | null) => error?.code === '23505'

export async function createPreregistro(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireUser()
  if ('error' in auth) return { error: auth.error ?? null }
  const { supabase, user } = auth

  let record
  try {
    const declaration = collectDeclaration(formData)
    if (!formData.get('agencia_zoom_id')) throw new ValidationError('Selecciona una agencia ZOOM del catálogo.')
    const contact = (key: string, label: string) => limited(formData, key, { required: true, label })!
    const { direccion, ...dest } = await destination(supabase, formData)
    record = {
      remitente_nombre: contact('remitente_nombre', 'Nombre del remitente'),
      remitente_documento: contact('remitente_documento', 'Documento del remitente'),
      remitente_telefono: contact('remitente_telefono', 'Teléfono del remitente'),
      remitente_direccion: contact('remitente_direccion', 'Dirección'),
      destinatario_nombre: contact('destinatario_nombre', 'Nombre del destinatario'),
      destinatario_documento: contact('destinatario_documento', 'Documento del destinatario'),
      destinatario_telefono: contact('destinatario_telefono', 'Teléfono del destinatario'),
      ...dest,
      agencia_zoom_direccion: direccion,
      ...declaration,
      codigo_env: envCode(),
    }
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    throw error
  }

  const { error } = await supabase.from('encomienda_preregistros').insert({ ...record, user_id: user.id })
  if (isUniqueViolation(error)) return { error: `El código ENV ${record.codigo_env} ya está registrado.` }
  if (error) return { error: 'No se pudo guardar el pre-registro. Intenta nuevamente.' }

  revalidatePath('/encomiendas', 'layout')
  redirect('/encomiendas/pre-registros')
}

type ShipmentDbError = { message: string; code?: string; details?: string; hint?: string }

function shipmentFailure(table: string, stage: string, error: ShipmentDbError) {
  const { message, code, details, hint } = error
  console.error('[encomiendas] Error guardando encomienda', { table, stage, message, code, details, hint })
  return { error: `Error guardando encomienda: ${message} (Error ${stage}; public.${table})` }
}

export async function createShipment(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireUser()
  if ('error' in auth) return { error: auth.error ?? null }
  const { supabase, user } = auth

  const preregistroId = String(formData.get('preregistro_id') ?? '')
  if (preregistroId && !isUuid(preregistroId)) return { error: 'El pre-registro no es válido.' }
  if (preregistroId) {
    const { data: pre, error } = await supabase
      .from('encomienda_preregistros')
      .select('estado')
      .eq('id', preregistroId)
      .maybeSingle()
    if (error) return shipmentFailure('encomienda_preregistros', 'consultando pre-registro', error)
    if (!pre) return { error: 'El pre-registro no existe o no tienes acceso.' }
    if (pre.estado !== 'Pendiente') return { error: 'Este pre-registro ya fue convertido o anulado.' }
  }

  let shipment
  let packages: ReturnType<typeof parsePackages>
  let content: ReturnType<typeof parseContent>
  let guides: ReturnType<typeof parseGuides>
  try {
    packages = parsePackages(formData.get('paquetes'))
    content = parseContent(formData.get('contenido'))
    guides = parseGuides(formData.get('guias'), packages.length)
    const { direccion, ...dest } = await destination(supabase, formData, error => {
      throw new ValidationError(shipmentFailure('zoom_agencias', 'consultando agencia ZOOM', error).error)
    })
    const linesTotal = content.some((l) => l.valor_usd !== null)
      ? Math.round(content.reduce((sum, l) => sum + (l.valor_usd ?? 0), 0) * 100) / 100
      : null
    shipment = {
      ...parties(formData),
      ...dest,
      agencia_zoom_direccion: direccion,
      codigo_env: envCode(formData),
      preregistro_id: preregistroId || null,
      contenido_declarado: content.map((l) => (l.cantidad ? `${l.cantidad} x ${l.descripcion}` : l.descripcion)).join('\n') || null,
      codigo_guia: guides.map((g) => g.numero_guia).join(', ') || null,
      valor_fob: amount(formData.get('valor_fob'), 'Total FOB') ?? linesTotal,
      estado: oneOf(formData, 'estado', SHIPMENT_STATUSES, 'Estado de encomienda') ?? 'Recibida',
      fecha_recepcion: date(formData, 'fecha_recepcion', 'Fecha de recepción'),
      fecha_salida: date(formData, 'fecha_salida', 'Fecha de salida'),
      fecha_llegada_estimada: date(formData, 'fecha_llegada_estimada', 'Fecha estimada de llegada'),
      observaciones: limited(formData, 'observaciones'),
      ...shipmentTotals(packages),
    }
    if (shipment.fecha_salida && shipment.fecha_recepcion && shipment.fecha_salida < shipment.fecha_recepcion) {
      throw new ValidationError('La fecha de salida no puede ser anterior a la recepción.')
    }
    if (shipment.fecha_llegada_estimada && shipment.fecha_salida && shipment.fecha_llegada_estimada < shipment.fecha_salida) {
      throw new ValidationError('La llegada estimada no puede ser anterior a la salida.')
    }
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    throw error
  }

  const { data: created, error } = await supabase
    .from('encomiendas')
    .insert({ ...shipment, user_id: user.id })
    .select('id')
    .single()
  if (error || !created?.id) return shipmentFailure('encomiendas', 'creando encomienda', error ?? { message: 'El INSERT no devolvió un ID.' })

  const withParent = <T extends object>(rows: T[]) =>
    rows.map((row) => ({ ...row, encomienda_id: created.id, user_id: user.id }))

  const undoShipment = async (table: string, stage: string, cause: ShipmentDbError) => {
    const failure = shipmentFailure(table, stage, cause)
    const { error: undoError } = await supabase.from('encomiendas').delete().eq('id', created.id).select('id').single()
    if (!undoError) return failure
    const undo = shipmentFailure('encomiendas', 'revirtiendo encomienda', undoError)
    return { error: `${failure.error}. ${undo.error}. Revisa el listado antes de reintentar.` }
  }

  const { error: packageError } = await supabase.from('encomienda_paquetes').insert(withParent(packages))
  if (packageError) return undoShipment('encomienda_paquetes', 'guardando paquetes', packageError)
  if (content.length) {
    const { error } = await supabase.from('encomienda_contenido').insert(withParent(content))
    if (error) return undoShipment('encomienda_contenido', 'guardando mercancía', error)
  }
  if (guides.length) {
    const { error } = await supabase.from('encomienda_guias').insert(withParent(guides))
    if (error) return undoShipment('encomienda_guias', 'guardando guías', error)
  }
  const { error: eventError } = await supabase.from('encomienda_eventos').insert({
    encomienda_id: created.id,
    user_id: user.id,
    evento: preregistroId ? 'Encomienda registrada desde pre-registro' : 'Encomienda registrada',
    estado_nuevo: shipment.estado,
  })
  if (eventError) return undoShipment('encomienda_eventos', 'creando evento', eventError)

  if (preregistroId) {
    const { error } = await supabase
      .from('encomienda_preregistros')
      .update({ estado: 'Convertido', encomienda_id: created.id, updated_at: new Date().toISOString() })
      .eq('id', preregistroId)
      .eq('estado', 'Pendiente')
      .select('id')
      .single()
    if (error) {
      const failure = shipmentFailure('encomienda_preregistros', 'actualizando pre-registro', error)
      return { error: `${failure.error}. La encomienda ${shipment.codigo_env} ya se creó; revisa el listado antes de reintentar.` }
    }
  }

  revalidatePath('/encomiendas', 'layout')
  redirect(`/encomiendas/listado?creada=${created.id}`)
}
