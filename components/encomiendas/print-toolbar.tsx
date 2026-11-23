'use client'

import Link from 'next/link'
import { ArrowLeft, Eye, Printer } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type DocTab = { href: string; label: string; active?: boolean }

export function PrintToolbar({
  backHref,
  tabs = [],
  previewTitle,
}: {
  backHref: string
  tabs?: DocTab[]
  previewTitle?: string
}) {
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
          Imprimir / Guardar PDF
        </Button>
      </div>
      {previewTitle && (
        <p className="flex items-center justify-center gap-2 border-t border-border bg-muted/60 px-4 py-2 text-center text-xs text-muted-foreground">
          <Eye aria-hidden="true" className="size-3.5" />
          <span>
            <span className="font-semibold text-foreground">{previewTitle}</span>
            {' · Revisa el documento antes de imprimir. Usa "Guardar como PDF" en el diálogo de impresión, tamaño A4.'}
          </span>
        </p>
      )}
    </div>
  )
}
