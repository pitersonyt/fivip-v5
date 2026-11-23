import { FormSection, TextAreaField, TextField } from '@/components/forms/form-fields'
import { ZoomDestination } from '@/components/encomiendas/zoom-destination'
import { ORIGIN_COUNTRY } from '@/lib/encomiendas'
import type { PartyData } from '@/lib/encomiendas-data'
import type { ZoomAgency } from '@/lib/zoom-agencias-data'

export type ZoomAgencyOption = Pick<ZoomAgency, 'id' | 'estado' | 'ciudad' | 'nombre_agencia' | 'direccion'>

export type PartyDefaults = Partial<Record<keyof PartyData | 'codigo_env', string | null>>

const v = (value: string | null | undefined) => value ?? undefined

export function SenderFields({ defaults = {} }: { defaults?: PartyDefaults }) {
  return (
    <FormSection title="Remitente" description="Cliente que envía desde Perú.">
      <TextField
        id="remitente_nombre"
        label="Nombre completo"
        autoComplete="off"
        required
        defaultValue={v(defaults.remitente_nombre)}
      />
      <TextField
        id="remitente_documento"
        label="Documento / identificación"
        hint="DNI, carné de extranjería, PTP o pasaporte."
        defaultValue={v(defaults.remitente_documento)}
      />
      <TextField
        id="remitente_telefono"
        label="Teléfono / WhatsApp"
        type="tel"
        inputMode="tel"
        placeholder="+51 ..."
        defaultValue={v(defaults.remitente_telefono)}
      />
      <TextField
        id="remitente_direccion"
        label="Dirección"
        className="sm:col-span-2"
        defaultValue={v(defaults.remitente_direccion)}
      />
      <TextField id="remitente_ciudad" label="Ciudad" defaultValue={v(defaults.remitente_ciudad)} />
      <TextField id="remitente_pais" label="País" defaultValue={defaults.remitente_pais ?? ORIGIN_COUNTRY} />
      <TextField
        id="remitente_email"
        label="Email (opcional)"
        type="email"
        autoComplete="off"
        defaultValue={v(defaults.remitente_email)}
      />
    </FormSection>
  )
}

export function RecipientFields({
  agencies,
  defaults = {},
  envCodeField,
}: {
  agencies: ZoomAgencyOption[]
  defaults?: PartyDefaults
  envCodeField?: React.ReactNode
}) {
  return (
    <FormSection title="Destinatario" description="Persona que retira en Venezuela.">
      <TextField
        id="destinatario_nombre"
        label="Nombre completo"
        autoComplete="off"
        required
        defaultValue={v(defaults.destinatario_nombre)}
      />
      <TextField
        id="destinatario_documento"
        label="Cédula / identificación"
        placeholder="V-12345678"
        defaultValue={v(defaults.destinatario_documento)}
      />
      <TextField
        id="destinatario_telefono"
        label="Teléfono"
        type="tel"
        inputMode="tel"
        placeholder="+58 ..."
        defaultValue={v(defaults.destinatario_telefono)}
      />
      <ZoomDestination agencies={agencies} defaults={defaults} />
      {envCodeField}
      <TextAreaField
        id="destinatario_observaciones"
        label="Observaciones de entrega / retiro"
        className="sm:col-span-2 lg:col-span-3"
        defaultValue={v(defaults.destinatario_observaciones)}
      />
    </FormSection>
  )
}

export function EnvCodeField({ defaultValue }: { defaultValue?: string | null }) {
  return (
    <TextField
      id="codigo_env"
      label="Código ENV (FIVIP)"
      placeholder="ENV-..."
      autoCapitalize="characters"
      maxLength={30}
      pattern="[A-Za-z0-9-]{3,30}"
      hint="Déjalo vacío para generarlo automáticamente."
      defaultValue={defaultValue ?? undefined}
      className="font-mono"
    />
  )
}
