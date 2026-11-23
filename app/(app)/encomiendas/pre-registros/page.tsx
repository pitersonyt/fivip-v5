import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightLeft, FileText, Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { StatGrid } from '@/components/stat-card'
import { RecordsTable, StatusBadge } from '@/components/encomiendas/records-table'
import { formatDate, preregistrosPage } from '@/lib/encomiendas'
import { listPreregistros } from '@/lib/encomiendas-data'

export const metadata: Metadata = { title: 'Pre-registros' }

export default async function Page() {
  const { data, error } = await listPreregistros()
  const config = preregistrosPage

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Link href="/encomiendas/pre-registros/nuevo" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            Nuevo pre-registro
          </Link>
        }
      />
      <StatGrid stats={config.stats} />
      <RecordsTable
        title={config.tableTitle}
        columns={config.columns}
        emptyTitle={config.emptyTitle}
        emptyDescription={config.emptyDescription}
        error={error}
        rows={data.map((p) => ({
          key: p.id,
          cells: [
            <span key="c" className="font-mono text-xs">{p.codigo_env ?? '—'}</span>,
            formatDate(p.created_at),
            <div key="r" className="flex flex-col">
              <span className="font-medium text-foreground">{p.remitente_nombre}</span>
              <span className="text-xs text-muted-foreground">{p.remitente_telefono ?? ''}</span>
            </div>,
            p.destinatario_nombre,
            [p.destinatario_ciudad, p.destinatario_estado].filter(Boolean).join(', ') || '—',
            p.cantidad_paquetes ?? '—',
            <StatusBadge key="s" status={p.estado} />,
            p.estado === 'Pendiente' ? (
              <Link
                key="a"
                href={`/encomiendas/nueva?pre=${p.id}`}
                className={buttonVariants({ size: 'sm' })}
              >
                <ArrowRightLeft aria-hidden="true" />
                Convertir
              </Link>
            ) : p.encomienda_id ? (
              <Link
                key="a"
                href={`/encomiendas/documentos/${p.encomienda_id}/declaracion`}
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
              >
                <FileText aria-hidden="true" />
                Ver encomienda
              </Link>
            ) : (
              '—'
            ),
          ],
        }))}
      />
    </>
  )
}
