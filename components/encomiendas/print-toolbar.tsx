'use client'

import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type DocTab = { href: string; label: string; active?: boolean }

export function PrintToolbar({ backHref, tabs = [] }: { backHref: string; tabs?: DocTab[] }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-card print:hidden">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href={backHref} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          <ArrowLeft aria-hidden="true" />
          Volver
        </Link>
        {tabs.length > 0 && (
          <nav aria-label="Documentos" className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                aria-current={t.active ? 'page' : undefined}
                className={cn(buttonVariants({ variant: t.active ? 'secondary' : 'ghost', size: 'sm' }))}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        )}
        <Button size="sm" onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          Imprimir
        </Button>
      </div>
    </div>
  )
}
