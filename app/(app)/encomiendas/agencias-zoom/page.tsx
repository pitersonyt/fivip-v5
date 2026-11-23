import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/page-header'
import { RecordsTable } from '@/components/encomiendas/records-table'
import { ZoomAgencyForm, ZoomAgencyImport } from '@/components/encomiendas/zoom-agency-forms'
import { toggleZoomAgency } from './actions'
import { VENEZUELA_STATES, formatDate } from '@/lib/encomiendas'
import { isUuid } from '@/lib/encomiendas-data'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getZoomAgency, listZoomAgencies, type ZoomAgencyFilters } from '@/lib/zoom-agencias-data'

export const metadata: Metadata = { title: 'Agencias ZOOM' }

const selectClass =
  'h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-48'

const ACTIVITY = [
  { value: 'activas', label: 'Activas' },
  { value: 'inactivas', label: 'Inactivas' },
  { value: 'todas', label: 'Todas' },
] as const

const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined)

export default async function Page({ searchParams }: PageProps<'/encomiendas/agencias-zoom'>) {
  const sp = await searchParams
  const q = one(sp.q)?.slice(0, 80)
  const estado = VENEZUELA_STATES.find((s) => s === one(sp.estado))
  const activo = ACTIVITY.find((a) => a.value === one(sp.activo))?.value ?? 'activas'
  const editId = one(sp.editar)
  const filters: ZoomAgencyFilters = { q, estado, estadoActivo: activo }

  const [{ data, error }, editing] = await Promise.all([
    listZoomAgencies(filters),
    isUuid(editId) ? getZoomAgency(editId) : Promise.resolve(null),
  ])
  const disabled = !isSupabaseConfigured()
  const importadas = one(sp.importadas)

  return (
    <>
      <PageHeader
        title="Agencias ZOOM"
        description="Catálogo de oficinas ZOOM en Venezuela usado para seleccionar el destino de cada encomienda."
      />

      {one(sp.guardada) && (
        <p role="status" className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
          Agencia guardada.
        </p>
      )}
      {importadas !== undefined && (
        <p role="status" className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
          {`Importación completada: ${Number(importadas) || 0} agencias nuevas, ${Number(one(sp.omitidas)) || 0} omitidas por estar repetidas.`}
        </p>
      )}

      <RecordsTable
        title="Catálogo de agencias"
        columns={[
          { label: 'Estado' },
          { label: 'Ciudad' },
          { label: 'Agencia' },
          { label: 'Dirección' },
          { label: 'Situación' },
          { label: 'Actualizada' },
          { label: 'Acciones', align: 'right' },
        ]}
        emptyTitle={q || estado || activo !== 'activas' ? 'Sin resultados' : 'El catálogo está vacío'}
        emptyDescription={
          q || estado || activo !== 'activas'
            ? 'Ninguna agencia coincide con los filtros aplicados.'
            : 'Agrega o importa las agencias ZOOM reales para habilitar la selección de destino.'
        }
        error={error}
        filters={
          <form method="get" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center" role="search">
            <label htmlFor="agencias-q" className="sr-only">Buscar agencia</label>
            <Input
              id="agencias-q"
              name="q"
              defaultValue={q}
              placeholder="Buscar por agencia, ciudad o dirección"
              className="sm:w-72"
            />
            <label htmlFor="agencias-estado" className="sr-only">Filtrar por estado</label>
            <select id="agencias-estado" name="estado" defaultValue={estado ?? ''} className={selectClass}>
              <option value="">Todos los estados</option>
              {VENEZUELA_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <label htmlFor="agencias-activo" className="sr-only">Filtrar por situación</label>
            <select id="agencias-activo" name="activo" defaultValue={activo} className={selectClass}>
              {ACTIVITY.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              <Search aria-hidden="true" />
              Filtrar
            </Button>
          </form>
        }
        rows={data.map((a) => ({
          key: a.id,
          highlighted: a.id === editing?.id,
          cells: [
            a.estado,
            a.ciudad,
            <span key="n" className="font-medium text-foreground">{a.nombre_agencia}</span>,
            <span key="d" className="text-muted-foreground">{a.direccion ?? '—'}</span>,
            <span
              key="s"
              className={
                a.active
                  ? 'rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success'
                  : 'rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'
              }
            >
              {a.active ? 'Activa' : 'Inactiva'}
            </span>,
            formatDate(a.updated_at),
            <div key="acc" className="flex justify-end gap-1">
              <Link
                href={`/encomiendas/agencias-zoom?editar=${a.id}#agencia-form`}
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
              >
                Editar
              </Link>
              <form action={toggleZoomAgency}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="active" value={String(!a.active)} />
                <Button type="submit" size="sm" variant="ghost" disabled={disabled}>
                  {a.active ? 'Desactivar' : 'Activar'}
                </Button>
              </form>
            </div>,
          ],
        }))}
      />

      <div id="agencia-form" className="grid scroll-mt-20 grid-cols-1 gap-6 xl:grid-cols-2">
        <ZoomAgencyForm disabled={disabled} agency={editing} />
        <ZoomAgencyImport disabled={disabled} />
      </div>
    </>
  )
}
