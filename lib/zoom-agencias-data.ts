import { createClient } from '@/lib/supabase/server'

export type ZoomAgency = {
  id: string
  estado: string
  ciudad: string
  nombre_agencia: string
  direccion: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type ZoomAgencyFilters = { q?: string; estado?: string; estadoActivo?: 'activas' | 'inactivas' | 'todas' }

const LOAD_ERROR = 'No se pudo cargar el catálogo de agencias ZOOM. Verifica que la migración 003 esté aplicada.'

const escapeLike = (value: string) => value.replace(/[\\%_,()]/g, (c) => `\\${c}`)

export async function listZoomAgencies(
  filters: ZoomAgencyFilters = {},
): Promise<{ data: ZoomAgency[]; error: string | null }> {
  const supabase = await createClient()
  if (!supabase) return { data: [], error: null }

  let query = supabase
    .from('zoom_agencias')
    .select('*')
    .order('estado')
    .order('ciudad')
    .order('nombre_agencia')
    .limit(1000)

  const activo = filters.estadoActivo ?? 'activas'
  if (activo === 'activas') query = query.eq('active', true)
  if (activo === 'inactivas') query = query.eq('active', false)
  if (filters.estado) query = query.eq('estado', filters.estado)
  const q = filters.q?.trim().slice(0, 80)
  if (q) {
    const term = `%${escapeLike(q)}%`
    query = query.or(`nombre_agencia.ilike.${term},ciudad.ilike.${term},direccion.ilike.${term}`)
  }

  const { data, error } = await query
  return { data: (data as ZoomAgency[] | null) ?? [], error: error ? LOAD_ERROR : null }
}

export async function getZoomAgency(id: string) {
  const supabase = await createClient()
  if (!supabase) return null
  const { data } = await supabase.from('zoom_agencias').select('*').eq('id', id).maybeSingle()
  return (data as ZoomAgency | null) ?? null
}
