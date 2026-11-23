'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Column } from '@/components/data-table-shell'
import { RecordsTable, StatusBadge, type RecordRow } from '@/components/encomiendas/records-table'
import { GuideStatusForm } from '@/components/encomiendas/zoom-guide-forms'
import { formatKg } from '@/lib/encomiendas'
import type { AssignableShipment, GuideRecord } from '@/lib/encomiendas-data'

export function ZoomGuidesTable({
  title,
  columns,
  guides,
  shipments,
  highlightShipmentId,
  disabled,
  emptyTitle,
  emptyDescription,
  error,
}: {
  title: string
  columns: Column[]
  guides: GuideRecord[]
  shipments: AssignableShipment[]
  highlightShipmentId?: string
  disabled: boolean
  emptyTitle: string
  emptyDescription: string
  error?: string | null
}) {
  const [query, setQuery] = useState('')
  const byId = useMemo(() => new Map(shipments.map((s) => [s.id, s])), [shipments])

  const rows: RecordRow[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    return guides
      .filter((g) => {
        if (!q) return true
        const s = byId.get(g.encomienda_id)
        return [g.numero_guia, s?.codigo_env, s?.codigo, s?.destinatario_nombre].some((v) => v?.toLowerCase().includes(q))
      })
      .map((g) => {
        const s = byId.get(g.encomienda_id)
        return {
          key: g.id,
          highlighted: g.encomienda_id === highlightShipmentId,
          cells: [
            <span key="n" className="font-mono font-medium">{g.numero_guia}</span>,
            <span key="c" className="font-mono">{s ? (s.codigo_env ?? s.codigo) : '—'}</span>,
            g.paquete_numero ? `Paquete ${g.paquete_numero}` : 'Toda la encomienda',
            <span key="p" className="tabular-nums">{formatKg(g.peso)}</span>,
            s?.agencia_zoom ?? '—',
            <StatusBadge key="e" status={g.estado} />,
            <div key="a" className="flex items-center gap-2">
              <GuideStatusForm guide={g} disabled={disabled} />
              <Link href={`/encomiendas/guias-zoom?editar=${g.id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Editar
              </Link>
              <Link
                href={`/encomiendas/documentos/${g.encomienda_id}/etiqueta`}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                Ver encomienda
              </Link>
            </div>,
          ],
        }
      })
  }, [guides, byId, query, highlightShipmentId, disabled])

  return (
    <RecordsTable
      title={title}
      columns={[...columns, { label: 'Acciones' }]}
      rows={rows}
      error={error}
      emptyTitle={query ? 'Sin coincidencias' : emptyTitle}
      emptyDescription={query ? 'Ninguna guía coincide con la búsqueda.' : emptyDescription}
      filters={
        <div className="relative">
          <label htmlFor="buscar-guias" className="sr-only">
            Buscar guía
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="buscar-guias"
            type="search"
            placeholder="Número de guía, código ENV o destinatario"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 sm:w-80"
          />
        </div>
      }
    />
  )
}
