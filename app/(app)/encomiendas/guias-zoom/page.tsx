import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { StatGrid } from '@/components/stat-card'
import { AssignGuidesForm, EditGuideForm } from '@/components/encomiendas/zoom-guide-forms'
import { ZoomGuidesTable } from '@/components/encomiendas/zoom-guides-table'
import { encomiendasSections } from '@/lib/encomiendas'
import { getGuidesOverview, isUuid } from '@/lib/encomiendas-data'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = { title: 'Guías ZOOM' }

const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined)

function currentWeek() {
  const today = new Date()
  const day = (today.getUTCDay() + 6) % 7
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - day))
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)] as const
}

export default async function Page({ searchParams }: PageProps<'/encomiendas/guias-zoom'>) {
  const sp = await searchParams
  const config = encomiendasSections['guias-zoom']
  const { data, error } = await getGuidesOverview()
  const { guides, shipments } = data
  const disabled = !isSupabaseConfigured()

  const editId = one(sp.editar)
  const editing = isUuid(editId) ? guides.find((g) => g.id === editId) : undefined
  const preselect = one(sp.encomienda)
  const assigning = !editing && (one(sp.asignar) !== undefined || isUuid(preselect))
  const assignedId = one(sp.asignada)

  const byShipment = new Map(shipments.map((s) => [s.id, s]))
  const [weekStart, weekEnd] = currentWeek()
  const inWeek = (d: string | null | undefined) => !!d && d.slice(0, 10) >= weekStart && d.slice(0, 10) <= weekEnd
  const perShipment = guides.reduce((m, g) => m.set(g.encomienda_id, (m.get(g.encomienda_id) ?? 0) + 1), new Map<string, number>())
  const values = [
    guides.filter((g) => g.estado !== 'Entregada' && g.estado !== 'Devuelta').length,
    [...perShipment.values()].filter((n) => n > 1).length,
    guides.filter((g) => inWeek(byShipment.get(g.encomienda_id)?.fecha_salida)).length,
    guides.filter((g) => inWeek(byShipment.get(g.encomienda_id)?.fecha_llegada_estimada)).length,
  ]

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Link href="/encomiendas/guias-zoom?asignar=1" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            Asignar guía ZOOM
          </Link>
        }
      />

      {assignedId && isUuid(assignedId) && (
        <p role="status" className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
          {`Guías guardadas para la encomienda ${(() => {
            const s = byShipment.get(assignedId)
            return s ? (s.codigo_env ?? s.codigo) : ''
          })()}.`}
        </p>
      )}

      <StatGrid stats={config.stats.map((s, i) => ({ ...s, value: error ? undefined : values[i] }))} />

      {assigning && (
        <AssignGuidesForm
          shipments={shipments}
          guides={guides}
          disabled={disabled}
          initialShipmentId={isUuid(preselect) ? preselect : undefined}
        />
      )}
      {editing && (
        <EditGuideForm guide={editing} shipment={byShipment.get(editing.encomienda_id)} disabled={disabled} />
      )}

      <ZoomGuidesTable
        title={config.tableTitle}
        columns={config.columns}
        guides={guides}
        shipments={shipments}
        highlightShipmentId={assignedId}
        disabled={disabled}
        emptyTitle={config.emptyTitle}
        emptyDescription="Usa “Asignar guía ZOOM” para registrar las guías de cada encomienda."
        error={error}
      />
    </>
  )
}
