import Link from 'next/link'
import { Save } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'

export function FormActions({
  cancelHref,
  disabled,
  submitLabel,
  pending = false,
  error,
}: {
  cancelHref: string
  disabled: boolean
  submitLabel: string
  pending?: boolean
  error?: string | null
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
      {disabled && (
        <p className="text-xs text-muted-foreground sm:mr-auto">
          Guardar se habilitará cuando Supabase esté conectado.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive sm:mr-auto">
          {error}
        </p>
      )}
      <Link href={cancelHref} className={buttonVariants({ variant: 'outline' })}>
        Cancelar
      </Link>
      <Button type="submit" disabled={disabled || pending} aria-busy={pending}>
        <Save aria-hidden="true" />
        {pending ? 'Guardando…' : submitLabel}
      </Button>
    </div>
  )
}
