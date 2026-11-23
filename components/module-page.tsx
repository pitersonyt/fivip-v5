import Link from 'next/link'
import { Download, Plus } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { StatGrid, type Stat } from '@/components/stat-card'
import { DataTableShell, type Column } from '@/components/data-table-shell'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export type ModuleConfig = {
  title: string
  description: string
  createLabel: string
  createHref?: string
  tableTitle: string
  searchPlaceholder: string
  columns: Column[]
  stats: Stat[]
  emptyTitle: string
  emptyDescription: string
}

export function ModulePage({ config }: { config: ModuleConfig }) {
  const disabled = !isSupabaseConfigured()

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <>
            <Button variant="outline" disabled={disabled}>
              <Download aria-hidden="true" />
              Exportar
            </Button>
            {config.createHref ? (
              <Link href={config.createHref} className={buttonVariants()}>
                <Plus aria-hidden="true" />
                {config.createLabel}
              </Link>
            ) : (
              <Button disabled={disabled}>
                <Plus aria-hidden="true" />
                {config.createLabel}
              </Button>
            )}
          </>
        }
      />
      <StatGrid stats={config.stats} />
      <DataTableShell
        title={config.tableTitle}
        columns={config.columns}
        searchPlaceholder={config.searchPlaceholder}
        emptyTitle={config.emptyTitle}
        emptyDescription={config.emptyDescription}
      />
    </>
  )
}
