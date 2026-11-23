import { createClient } from '@/lib/supabase/server'
import { getManifest } from '@/lib/encomiendas-data'

const cell = (value: unknown) => {
  const s = value === null || value === undefined ? '' : String(value)
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export async function GET(request: Request) {
  const supabase = await createClient()
  if (!supabase) return new Response('Supabase no está conectado.', { status: 503 })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('No autorizado.', { status: 401 })

  const fecha = new URL(request.url).searchParams.get('fecha') ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return new Response('Fecha inválida.', { status: 400 })

  const { data, error } = await getManifest(fecha)
  if (error) return new Response(error, { status: 500 })

  const header = [
    '#', 'Código ENV', 'Remitente', 'Documento remitente', 'Destinatario', 'Cédula destinatario',
    'Teléfono destinatario', 'Estado', 'Ciudad', 'Agencia ZOOM', 'Guías ZOOM', 'Paquetes',
    'Peso físico (kg)', 'Peso volumétrico (kg)', 'Peso facturable (kg)', 'FOB (USD)', 'Estado encomienda',
  ]
  const rows = data.rows.map((r, i) => [
    i + 1, r.codigo_env ?? r.codigo, r.remitente_nombre, r.remitente_documento, r.destinatario_nombre,
    r.destinatario_documento, r.destinatario_telefono, r.destinatario_estado, r.destinatario_ciudad,
    r.agencia_zoom, r.guias.join(' / '), r.cantidad_paquetes, r.peso_fisico_total, r.peso_volumetrico_total,
    r.peso_facturable_total, r.valor_fob, r.estado,
  ])
  const t = data.totales
  rows.push(['', 'TOTALES', '', '', '', '', '', '', '', '', '', t.paquetes, t.peso_fisico, t.peso_volumetrico, t.peso_facturable, t.fob, ''])

  const csv = '\uFEFF' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="manifiesto-${fecha}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
