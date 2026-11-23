import Link from 'next/link'
import { Save } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'

export function FormActions({ cancelHref, disabled, submitLabel }: { cancelHref: string; disabled: boolean; submitLabel: string }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
      {disabled && (
        <p className="text-xs text-muted-foreground sm:mr-auto">
          Guardar se habilitará cuando Supabase esté conectado.
        </p>
      )}
      <Link href={cancelHref} className={buttonVariants({ variant: 'outline' })}>
        Cancelar
      </Link>
      <Button type="submit" disabled={disabled}>
        <Save aria-hidden="true" />
        {submitLabel}
      </Button>
    </div>
  )
}
