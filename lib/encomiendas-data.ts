import { createClient } from '@/lib/supabase/server'

export type PartyData = {
  remitente_nombre: string
  remitente_documento: string | null
  remitente_telefono: string | null
  remitente_direccion: string | null
  remitente_ciudad: string | null
  remitente_pais: string | null
  remitente_email: string | null
  destinatario_nombre: string
  destinatario_documento: string | null
  destinatario_telefono: string | null
  destinatario_estado: string | null
  destinatario_ciudad: string | null
  agencia_zoom: string | null
  agencia_zoom_id?: string | null
  destinatario_observaciones: string | null
}

export type Preregistro = PartyData & {
  id: string
  codigo_env: string | null
  cantidad_paquetes: number | null
  contenido_declarado: string | null
  valor_fob: number | null
  observaciones: string | null
  estado: string
  encomienda_id: string | null
  created_at: string
}

export type Shipment = PartyData & {
  id: string
  codigo: string
  codigo_env: string | null
  preregistro_id: string | null
  valor_fob: number | null
  estado: string
  fecha_recepcion: string | null
  fecha_salida: string | null
  fecha_llegada_estimada: string | null
  observaciones: string | null
  cantidad_paquetes: number
  peso_fisico_total: number
  peso_volumetrico_total: number
  peso_facturable_total: number
  revisado: boolean
  agencia_zoom_direccion?: string | null
  created_at: string
}

export type ShipmentPackage = {
  numero: number
  ancho: number | null
  largo: number | null
  alto: number | null
  peso_fisico: number
  peso_volumetrico: number | null
  peso_facturable: number | null
}

export type ContentLine = {
  linea: number
  descripcion: string
  cantidad: number | null
  marca?: string | null
  valor_usd?: number | null
}

export type Guide = {
  numero_guia: string
  peso: number | null
  estado: string
  paquete_numero: number | null
}

export type ShipmentDocument = {
  shipment: Shipment
  paquetes: ShipmentPackage[]
  contenido: ContentLine[]
  guias: Guide[]
}

type Result<T> = { data: T; error: string | null }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (value: string | null | undefined): value is string => Boolean(value && UUID.test(value))

const LOAD_ERROR = 'No se pudieron cargar los datos. Verifica que la migración de Encomiendas esté aplicada.'

export async function listPreregistros(): Promise<Result<Preregistro[]>> {
  const supabase = await createClient()
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('encomienda_preregistros')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  return { data: (data as Preregistro[] | null) ?? [], error: error ? LOAD_ERROR : null }
}

export async function getPreregistro(id: string | undefined) {
  if (!isUuid(id)) return null
  const supabase = await createClient()
  if (!supabase) return null
  const { data } = await supabase.from('encomienda_preregistros').select('*').eq('id', id).maybeSingle()
  return (data as Preregistro | null) ?? null
}

export async function listShipments(): Promise<Result<Shipment[]>> {
  const supabase = await createClient()
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('encomiendas')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  return { data: (data as Shipment[] | null) ?? [], error: error ? LOAD_ERROR : null }
}

export async function getShipmentDocument(id: string): Promise<ShipmentDocument | null> {
  if (!isUuid(id)) return null
  const supabase = await createClient()
  if (!supabase) return null

  const [shipment, paquetes, contenido, guias] = await Promise.all([
    supabase.from('encomiendas').select('*').eq('id', id).maybeSingle(),
    supabase.from('encomienda_paquetes').select('*').eq('encomienda_id', id).order('numero'),
    supabase.from('encomienda_contenido').select('*').eq('encomienda_id', id).order('linea'),
    supabase.from('encomienda_guias').select('*').eq('encomienda_id', id).order('created_at'),
  ])
  if (!shipment.data) return null

  return {
    shipment: shipment.data as Shipment,
    paquetes: (paquetes.data as ShipmentPackage[] | null) ?? [],
    contenido: (contenido.data as ContentLine[] | null) ?? [],
    guias: (guias.data as Guide[] | null) ?? [],
  }
}

export type ManifestRow = Shipment & { guias: string[] }

export type Manifest = {
  fecha_salida: string | null
  fechas_disponibles: string[]
  rows: ManifestRow[]
  totales: {
    encomiendas: number
    paquetes: number
    peso_fisico: number
    peso_volumetrico: number
    peso_facturable: number
    fob: number
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100

export async function getManifest(requestedDate?: string): Promise<Result<Manifest>> {
  const empty: Manifest = {
    fecha_salida: null,
    fechas_disponibles: [],
    rows: [],
    totales: { encomiendas: 0, paquetes: 0, peso_fisico: 0, peso_volumetrico: 0, peso_facturable: 0, fob: 0 },
  }
  const supabase = await createClient()
  if (!supabase) return { data: empty, error: null }

  const { data: dates, error: datesError } = await supabase
    .from('encomiendas')
    .select('fecha_salida')
    .not('fecha_salida', 'is', null)
    .order('fecha_salida', { ascending: false })
    .limit(500)
  if (datesError) return { data: empty, error: LOAD_ERROR }

  const fechas = [...new Set((dates ?? []).map((d) => d.fecha_salida as string))]
  const fecha =
    requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : (fechas[0] ?? null)
  if (!fecha) return { data: { ...empty, fechas_disponibles: fechas }, error: null }

  const { data: shipments, error } = await supabase
    .from('encomiendas')
    .select('*')
    .eq('fecha_salida', fecha)
    .order('created_at')
  if (error) return { data: empty, error: LOAD_ERROR }

  const list = (shipments as Shipment[] | null) ?? []
  const ids = list.map((s) => s.id)
  const { data: guias } = ids.length
    ? await supabase.from('encomienda_guias').select('encomienda_id, numero_guia').in('encomienda_id', ids)
    : { data: [] as { encomienda_id: string; numero_guia: string }[] }

  const rows: ManifestRow[] = list.map((s) => ({
    ...s,
    guias: (guias ?? []).filter((g) => g.encomienda_id === s.id).map((g) => g.numero_guia),
  }))
  const sum = (pick: (r: ManifestRow) => number | null) => round2(rows.reduce((acc, r) => acc + Number(pick(r) ?? 0), 0))

  return {
    data: {
      fecha_salida: fecha,
      fechas_disponibles: fechas,
      rows,
      totales: {
        encomiendas: rows.length,
        paquetes: sum((r) => r.cantidad_paquetes),
        peso_fisico: sum((r) => r.peso_fisico_total),
        peso_volumetrico: sum((r) => r.peso_volumetrico_total),
        peso_facturable: sum((r) => r.peso_facturable_total),
        fob: sum((r) => r.valor_fob),
      },
    },
    error: null,
  }
}
