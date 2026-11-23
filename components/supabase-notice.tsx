import { DatabaseZap } from 'lucide-react'

export function SupabaseNotice() {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-chart-3/40 bg-chart-3/10 px-4 py-3 text-sm text-foreground"
    >
      <DatabaseZap className="mt-0.5 size-4 shrink-0 text-chart-3" aria-hidden="true" />
      <p>
        <span className="font-medium">Supabase no está conectado.</span>{' '}
        <span className="text-muted-foreground">
          La autenticación y los datos están deshabilitados. Agrega la integración de Supabase para habilitar el inicio
          de sesión y los registros en tiempo real.
        </span>
      </p>
    </div>
  )
}
