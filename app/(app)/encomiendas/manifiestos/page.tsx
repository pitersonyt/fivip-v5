import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, Printer } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { StatGrid } from '@/components/stat-card'
import { RecordsTable } from '@/components/encomiendas/records-table'
import { formatDate, formatKg, formatUsd, manifiestosPage } from '@/lib/encomiendas'
import { getManifest } from '@/lib/encomiendas-data'

export const metadata: Metadata = { title: 'Manifiestos' }

const selectClass =
  'h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

export default async function Page({ searchParams }: PageProps<'/encomiendas/manifiestos'>) {
  const { fecha } = await searchParams
  const { data, error } = await getManifest(typeof fecha === 'string' ? fecha : undefined)
  const config = manifiestosPage
  const current = data.fecha_salida

  const filters =
    data.fechas_disponibles.length > 0 ? (
      <form method="get" className="flex items-center gap-2">
        <label htmlFor="fecha" className="text-sm text-muted-foreground">
          Salida
        </label>
        <select id="fecha" name="fecha" defaultValue={current ?? ''} className={selectClass}>
          {data.fechas_disponibles.map((f) => (
            <option key={f} value={f}>
              {formatDate(f)}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">
          Ver
        </Button>
      </form>
    ) : undefined

  return (
    <>
      <PageHeader
        title={config.title}
        description={current ? `${config.description} Salida del ${formatDate(current)}.` : config.description}
        actions={
          current && data.rows.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/encomiendas/manifiesto/${current}`}
                className={buttonVariants({ variant: 'outline' })}
              >
                <Printer aria-hidden="true" />
                Imprimir
              </Link>
              <a href={`/api/encomiendas/manifiesto?fecha=${current}`} className={buttonVariants()} download>
                <Download aria-hidden="true" />
                Exportar CSV
              </a>
            </div>
          ) : undefined
        }
      />
      <StatGrid stats={config.stats} />
      <RecordsTable
        title={config.tableTitle}
        columns={config.columns}
        emptyTitle={config.emptyTitle}
        emptyDescription={config.emptyDescription}
        error={error}
        filters={filters}
        rows={data.rows.map((r, i) => ({
          key: r.id,
          cells: [
            i + 1,
            <span key="c" className="font-mono text-xs">{r.codigo_env ?? r.codigo}</span>,
            r.remitente_nombre,
            r.destinatario_nombre,
            [r.destinatario_ciudad, r.destinatario_estado].filter(Boolean).join(', ') || '—',
            <span key="g" className="font-mono text-xs">{r.guias.join(', ') || '—'}</span>,
            r.cantidad_paquetes,
            formatKg(r.peso_facturable_total),
            formatUsd(r.valor_fob),
          ],
        }))}
        footer={
          data.rows.length
            ? [
                'Totales',
                `${data.totales.encomiendas} encomiendas`,
                '',
                '',
                '',
                '',
                data.totales.paquetes,
                formatKg(data.totales.peso_facturable),
                formatUsd(data.totales.fob),
              ]
            : undefined
        }
      />
    </>
  )
}
