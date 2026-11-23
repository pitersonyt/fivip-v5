import { DataTableShell, type Column } from '@/components/data-table-shell'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type RecordRow = { key: string; cells: React.ReactNode[]; highlighted?: boolean }

export function RecordsTable({
  title,
  columns,
  rows,
  emptyTitle,
  emptyDescription,
  error,
  filters,
  footer,
}: {
  title: string
  columns: Column[]
  rows: RecordRow[]
  emptyTitle: string
  emptyDescription: string
  error?: string | null
  filters?: React.ReactNode
  footer?: React.ReactNode[]
}) {
  if (rows.length === 0) {
    return (
      <DataTableShell
        title={title}
        columns={columns}
        filters={filters}
        emptyTitle={error ? 'No se pudieron cargar los datos' : emptyTitle}
        emptyDescription={error ?? emptyDescription}
      />
    )
  }

  const align = (i: number) => columns[i]?.align === 'right' && 'text-right'

  return (
    <section aria-label={title} className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {title} <span className="font-normal text-muted-foreground">{`(${rows.length})`}</span>
        </h2>
        {filters && <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{filters}</div>}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            {columns.map((col, i) => (
              <TableHead
                key={col.label}
                className={cn(
                  'h-10 px-4 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-muted-foreground',
                  align(i),
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key} className={cn(row.highlighted && 'bg-accent/60')}>
              {row.cells.map((cell, i) => (
                <TableCell key={i} className={cn('px-4 py-3 whitespace-nowrap', align(i))}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {footer && (
            <TableRow className="bg-muted/60 font-semibold hover:bg-muted/60">
              {footer.map((cell, i) => (
                <TableCell key={i} className={cn('px-4 py-3 whitespace-nowrap tabular-nums', align(i))}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  )
}

const STATUS_TONE: Record<string, string> = {
  Pendiente: 'bg-chart-3/15 text-foreground',
  Convertido: 'bg-success/15 text-success',
  Entregada: 'bg-success/15 text-success',
  Anulado: 'bg-destructive/10 text-destructive',
  Devuelta: 'bg-destructive/10 text-destructive',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap',
        STATUS_TONE[status] ?? 'bg-accent text-accent-foreground',
      )}
    >
      {status}
    </span>
  )
}
