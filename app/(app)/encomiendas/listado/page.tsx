import type { Metadata } from 'next'
import Link from 'next/link'
import { PackagePlus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { StatGrid } from '@/components/stat-card'
import { RecordsTable, StatusBadge } from '@/components/encomiendas/records-table'
import { formatDate, formatKg, listadoPage } from '@/lib/encomiendas'
import { listShipments } from '@/lib/encomiendas-data'

export const metadata: Metadata = { title: 'Listado de encomiendas' }

const DOCS = [
  { slug: 'declaracion', label: 'Vista previa Declaración Jurada' },
  { slug: 'etiqueta', label: 'Vista previa Etiqueta + Control' },
  { slug: 'guias', label: 'Guías' },
] as const

export default async function Page({ searchParams }: PageProps<'/encomiendas/listado'>) {
  const { creada } = await searchParams
  const { data, error } = await listShipments()
  const config = listadoPage

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Link href="/encomiendas/nueva" className={buttonVariants()}>
            <PackagePlus aria-hidden="true" />
            Nueva encomienda
          </Link>
        }
      />
      {typeof creada === 'string' && (
        <p role="status" className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
          Encomienda registrada. Ya puedes imprimir su declaración jurada, etiqueta y guías.
        </p>
      )}
      <StatGrid stats={config.stats} />
      <RecordsTable
        title={config.tableTitle}
        columns={config.columns}
        emptyTitle={config.emptyTitle}
        emptyDescription={config.emptyDescription}
        error={error}
        rows={data.map((s) => ({
          key: s.id,
          highlighted: s.id === creada,
          cells: [
            <span key="c" className="font-mono text-xs">{s.codigo_env ?? s.codigo}</span>,
            formatDate(s.fecha_recepcion),
            s.remitente_nombre,
            <div key="d" className="flex flex-col">
              <span className="text-foreground">{s.destinatario_nombre}</span>
              <span className="text-xs text-muted-foreground">
                {[s.destinatario_ciudad, s.destinatario_estado].filter(Boolean).join(', ')}
              </span>
            </div>,
            s.agencia_zoom ?? '—',
            s.cantidad_paquetes,
            <span key="w" className="tabular-nums">{formatKg(s.peso_facturable_total)}</span>,
            <StatusBadge key="s" status={s.estado} />,
            <div key="docs" className="flex flex-wrap justify-end gap-1">
              {DOCS.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/encomiendas/documentos/${s.id}/${doc.slug}`}
                  className={buttonVariants({ size: 'sm', variant: 'outline' })}
                >
                  {doc.label}
                </Link>
              ))}
            </div>,
          ],
        }))}
      />
    </>
  )
}
