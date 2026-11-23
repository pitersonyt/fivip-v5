import { cn } from '@/lib/utils'

export function BrandLogo({ className, inverted = true }: { className?: string; inverted?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary font-mono text-sm font-bold tracking-tight text-sidebar-primary-foreground"
      >
        FV
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn('text-base font-semibold tracking-tight', inverted ? 'text-white' : 'text-foreground')}>
          FIVIP <span className="text-sidebar-primary">PRO</span>
        </span>
        <span
          className={cn(
            'mt-1 text-[10px] font-medium uppercase tracking-[0.18em]',
            inverted ? 'text-sidebar-foreground/60' : 'text-muted-foreground',
          )}
        >
          Versión 5
        </span>
      </div>
    </div>
  )
}
