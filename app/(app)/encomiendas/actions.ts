'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MAX_PACKAGES, SHIPMENT_STATUSES, volumetricWeight } from '@/lib/encomiendas'
import { ValidationError, amount, date, oneOf, text, type FormState } from '@/lib/form-utils'

function parsePackages(raw: FormDataEntryValue | null) {
  let list: unknown
  try {
    list = JSON.parse(String(raw ?? '[]'))
  } catch {
    throw new ValidationError('La lista de paquetes no es válida.')
  }
  if (!Array.isArray(list) || list.length === 0) throw new ValidationError('Agrega al menos un paquete.')
  if (list.length > MAX_PACKAGES) throw new ValidationError(`Máximo ${MAX_PACKAGES} paquetes por encomienda.`)

  return list.map((item, i) => {
    const p = (item ?? {}) as Record<string, unknown>
    const n = i + 1
    const ancho = amount(p.ancho, `Ancho del paquete ${n}`)
    const largo = amount(p.largo, `Largo del paquete ${n}`)
    const alto = amount(p.alto, `Alto del paquete ${n}`)
    const peso_fisico = amount(p.peso, `Peso del paquete ${n}`)
    if (peso_fisico === null) throw new ValidationError(`Indica el peso físico del paquete ${n}.`)
    const vol = ancho && largo && alto ? volumetricWeight(ancho, largo, alto) : null
    return {
      numero: n,
      ancho,
      largo,
      alto,
      peso_fisico,
      peso_volumetrico: vol === null ? null : Math.round(vol * 100) / 100,
    }
  })
}

export async function createShipment(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase no está conectado.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Tu sesión expiró. Inicia sesión nuevamente.' }

  let shipment
  let packages: ReturnType<typeof parsePackages>
  try {
    const parsed = parsePackages(formData.get('paquetes'))
    packages = parsed
    const sum = (key: 'peso_fisico' | 'peso_volumetrico') =>
      Math.round(parsed.reduce((acc, p) => acc + (p[key] ?? 0), 0) * 100) / 100

    shipment = {
      remitente_nombre: text(formData, 'remitente_nombre', { required: true, label: 'Nombre del remitente' }),
      remitente_documento: text(formData, 'remitente_documento'),
      remitente_telefono: text(formData, 'remitente_telefono'),
      remitente_ciudad: text(formData, 'remitente_ciudad'),
      destinatario_nombre: text(formData, 'destinatario_nombre', { required: true, label: 'Nombre del destinatario' }),
      destinatario_documento: text(formData, 'destinatario_documento'),
      destinatario_telefono: text(formData, 'destinatario_telefono'),
      destinatario_ciudad: text(formData, 'destinatario_ciudad', { required: true, label: 'Ciudad del destinatario' }),
      agencia_zoom: text(formData, 'agencia_zoom'),
      codigo_guia: text(formData, 'codigo_guia'),
      contenido_declarado: text(formData, 'contenido_declarado'),
      valor_fob: amount(formData.get('valor_fob'), 'Valor FOB'),
      estado: oneOf(formData, 'estado', SHIPMENT_STATUSES, 'Estado del envío') ?? 'Pre-registrada',
      fecha_recepcion: date(formData, 'fecha_recepcion', 'Fecha de recepción'),
      fecha_salida: date(formData, 'fecha_salida', 'Fecha de salida'),
      fecha_llegada_estimada: date(formData, 'fecha_llegada_estimada', 'Fecha estimada de llegada'),
      observaciones: text(formData, 'observaciones'),
      cantidad_paquetes: packages.length,
      peso_fisico_total: sum('peso_fisico'),
      peso_volumetrico_total: sum('peso_volumetrico'),
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
  if (error || !created) return { error: 'No se pudo guardar la encomienda. Intenta nuevamente.' }

  const [{ error: pkgError }, { error: eventError }] = await Promise.all([
    supabase
      .from('encomienda_paquetes')
      .insert(packages.map((p) => ({ ...p, encomienda_id: created.id, user_id: user.id }))),
    supabase.from('encomienda_eventos').insert({
      encomienda_id: created.id,
      user_id: user.id,
      evento: 'Encomienda registrada',
      estado_nuevo: shipment.estado,
    }),
  ])
  if (pkgError || eventError) {
    await supabase.from('encomiendas').delete().eq('id', created.id)
    return { error: 'No se pudieron guardar los paquetes. Intenta nuevamente.' }
  }

  revalidatePath('/encomiendas', 'layout')
  redirect('/encomiendas/listado')
}
