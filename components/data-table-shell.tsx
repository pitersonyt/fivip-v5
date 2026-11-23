import { Inbox, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type Column = {
  label: string
  align?: 'left' | 'right'
}

export function DataTableShell({
  title,
  columns,
  emptyTitle,
  emptyDescription,
  searchPlaceholder,
  filters,
}: {
  title: string
  columns: Column[]
  emptyTitle: string
  emptyDescription: string
  searchPlaceholder?: string
  filters?: React.ReactNode
}) {
  const searchId = `search-${title.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <section aria-label={title} className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {filters}
          {searchPlaceholder && (
            <div className="relative">
              <label htmlFor={searchId} className="sr-only">
                {searchPlaceholder}
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input id={searchId} type="search" placeholder={searchPlaceholder} className="pl-8 sm:w-64" disabled />
            </div>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            {columns.map((col) => (
              <TableHead
                key={col.label}
                className={cn(
                  'h-10 px-4 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-muted-foreground',
                  col.align === 'right' && 'text-right',
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="px-4 py-14">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Inbox className="size-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
                <p className="max-w-sm text-sm text-pretty whitespace-normal text-muted-foreground">
                  {emptyDescription}
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  )
}
