import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatGrid, type Stat } from '@/components/stat-card'
import { DataTableShell, type Column } from '@/components/data-table-shell'
import type { NavItem } from '@/lib/navigation'

export type SectionPanelConfig = {
  title: string
  description: string
  stats: Stat[]
  recent: {
    title: string
    columns: Column[]
    emptyTitle: string
    emptyDescription: string
  }
}

export function SectionPanel({
  config,
  section,
  actions,
}: {
  config: SectionPanelConfig
  section: NavItem
  actions?: React.ReactNode
}) {
  const screens = section.children?.filter((child) => !child.exact) ?? []
  const headingId = `${section.href.replace(/\W+/g, '')}-screens`

  return (
    <>
      <PageHeader title={config.title} description={config.description} actions={actions} />
      <StatGrid stats={config.stats} />

      <section aria-labelledby={headingId} className="flex flex-col gap-3">
        <h2 id={headingId} className="text-sm font-semibold text-foreground">
          Pantallas
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {screens.map((screen) => {
            const Icon = screen.icon
            return (
              <li key={screen.href}>
                <Link
                  href={screen.href}
                  className="group flex h-full items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring/50 hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{screen.title}</span>
                  <ArrowRight
                    className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <DataTableShell
        title={config.recent.title}
        columns={config.recent.columns}
        emptyTitle={config.recent.emptyTitle}
        emptyDescription={config.recent.emptyDescription}
      />
    </>
  )
}
