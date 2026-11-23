import type { Metadata } from 'next'
import { CheckCircle2, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = { title: 'Configuración' }

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-3 md:gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-pretty text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-4 md:col-span-2">{children}</div>
    </section>
  )
}

function Field({ id, label, placeholder, disabled }: { id: string; label: string; placeholder?: string; disabled: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} placeholder={placeholder} disabled={disabled} />
    </div>
  )
}

export default function SettingsPage() {
  const connected = isSupabaseConfigured()

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Perfil del negocio, valores operativos predeterminados y conexión del sistema."
      />

      <div className="flex flex-col gap-4">
        <SettingsSection title="Perfil del negocio" description="Información que se muestra en comprobantes y reportes.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="business_name" label="Razón social" disabled={!connected} />
            <Field id="tax_id" label="RUC / Identificación tributaria" disabled={!connected} />
            <Field id="phone" label="Teléfono" disabled={!connected} />
            <Field id="email" label="Correo de contacto" disabled={!connected} />
          </div>
        </SettingsSection>

        <SettingsSection title="Operaciones" description="Valores predeterminados para nuevas remesas y tasas.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="base_currency" label="Moneda base" placeholder="p. ej. USD" disabled={!connected} />
            <Field id="default_fee" label="Comisión predeterminada (%)" disabled={!connected} />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Conexión a la base de datos"
          description="Supabase gestiona la autenticación y el almacenamiento de datos."
        >
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 px-4 py-3">
            {connected ? (
              <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
            ) : (
              <XCircle className="size-5 text-destructive" aria-hidden="true" />
            )}
            <div className="flex flex-col">
              <p className="text-sm font-medium text-foreground">{connected ? 'Conectado' : 'No conectado'}</p>
              <p className="text-xs text-muted-foreground">
                Requiere NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
              </p>
            </div>
          </div>
        </SettingsSection>

        <div className="flex justify-end">
          <Button disabled={!connected}>Guardar cambios</Button>
        </div>
      </div>
    </>
  )
}
