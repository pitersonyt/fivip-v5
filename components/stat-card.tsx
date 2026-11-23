import type { LucideIcon } from 'lucide-react'

export type Stat = {
  label: string
  icon: LucideIcon
  hint?: string
}

export function StatCard({ label, icon: Icon, hint }: Stat) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex size-8 items-center justify-center rounded-md bg-accent text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </div>
      <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
        <span aria-label="Sin datos">{'—'}</span>
      </p>
      <p className="text-xs text-muted-foreground">{hint ?? 'Sin datos todavía'}</p>
    </div>
  )
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <section aria-label="Resumen" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>
  )
}
