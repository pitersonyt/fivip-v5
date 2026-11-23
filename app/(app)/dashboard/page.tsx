import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, Clock, HandCoins, Send, TrendingUp, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatGrid } from '@/components/stat-card'
import { DataTableShell } from '@/components/data-table-shell'
import { encomiendasNav, entretenimientoNav, navGroups } from '@/lib/navigation'

export const metadata: Metadata = { title: 'Panel principal' }

const quickLinks = navGroups
  .flatMap((g) => g.items)
  .filter((i) => !i.children && i.href !== '/dashboard' && i.href !== '/settings')

const serviceShortcuts = [
  {
    item: encomiendasNav,
    description: 'Recepción, guías ZOOM, declaraciones y manifiestos de paquetes.',
  },
  {
    item: entretenimientoNav,
    description: 'Clientes, cuentas, suscripciones, vencimientos y rentabilidad.',
  },
]

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Panel principal"
        description="Resumen de la actividad de remesas, saldos y operaciones."
      />

      <StatGrid
        stats={[
          { label: 'Remesas de hoy', icon: Send },
          { label: 'Pagos pendientes', icon: Clock },
          { label: 'Deudas pendientes', icon: HandCoins },
          { label: 'Saldo bancario total', icon: Wallet },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DataTableShell
            title="Remesas recientes"
            columns={[
              { label: 'Código' },
              { label: 'Remitente' },
              { label: 'Beneficiario' },
              { label: 'Monto', align: 'right' },
              { label: 'Estado' },
            ]}
            emptyTitle="Sin actividad reciente"
            emptyDescription="Las últimas remesas se mostrarán aquí cuando haya datos disponibles."
          />
        </div>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="rates-heading" className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 id="rates-heading" className="text-sm font-semibold text-foreground">
                Tasas de cambio
              </h2>
              <TrendingUp className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="p-4 text-sm text-muted-foreground">No hay tasas configuradas.</p>
          </section>

          <section aria-labelledby="accounts-heading" className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 id="accounts-heading" className="text-sm font-semibold text-foreground">
                Cuentas bancarias
              </h2>
              <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="p-4 text-sm text-muted-foreground">No hay cuentas bancarias registradas.</p>
          </section>
        </div>
      </div>

      <section aria-labelledby="services-heading" className="flex flex-col gap-3">
        <h2 id="services-heading" className="text-sm font-semibold text-foreground">
          Servicios
        </h2>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {serviceShortcuts.map(({ item, description }) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex h-full items-center gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-ring/50 hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{item.title}</span>
                    <span className="text-sm text-pretty text-muted-foreground">{description}</span>
                  </span>
                  <ArrowRight
                    className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="modules-heading" className="flex flex-col gap-3">
        <h2 id="modules-heading" className="text-sm font-semibold text-foreground">
          Módulos
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {quickLinks.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring/50 hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <span className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
                    {item.title}
                    <ArrowRight
                      className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}
