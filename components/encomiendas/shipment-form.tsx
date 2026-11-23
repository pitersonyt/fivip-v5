'use client'

import { useActionState } from 'react'
import { FormSection, SelectField, TextAreaField, TextField } from '@/components/forms/form-fields'
import { FormActions } from '@/components/forms/form-actions'
import { PackageList } from '@/components/encomiendas/package-list'
import { createShipment } from '@/app/(app)/encomiendas/actions'
import { SHIPMENT_STATUSES } from '@/lib/encomiendas'
import { initialFormState } from '@/lib/form-utils'

export function ShipmentForm({ disabled }: { disabled: boolean }) {
  const [state, formAction, pending] = useActionState(createShipment, initialFormState)

  return (
    <form action={formAction} className="flex flex-col gap-6" aria-label="Nueva encomienda">
      <fieldset disabled={disabled || pending} className="flex flex-col gap-6">
        <FormSection title="Remitente">
          <TextField id="remitente_nombre" label="Nombre completo" autoComplete="off" required />
          <TextField id="remitente_documento" label="Documento de identidad" />
          <TextField id="remitente_telefono" label="Teléfono" type="tel" inputMode="tel" />
          <TextField id="remitente_ciudad" label="Ciudad / estado" />
        </FormSection>

        <FormSection title="Destinatario">
          <TextField id="destinatario_nombre" label="Nombre completo" autoComplete="off" required />
          <TextField id="destinatario_documento" label="Documento de identidad" />
          <TextField id="destinatario_telefono" label="Teléfono" type="tel" inputMode="tel" />
          <TextField id="destinatario_ciudad" label="Ciudad / estado" required />
          <TextField id="agencia_zoom" label="Agencia ZOOM" />
          <TextField id="codigo_guia" label="Código de guía" hint="Asignado por ZOOM al despachar." />
        </FormSection>

        <FormSection title="Paquetes y medidas" description="Medidas en centímetros y pesos en kilogramos.">
          <PackageList />
        </FormSection>

        <FormSection title="Contenido y declaración">
          <TextAreaField id="contenido_declarado" label="Contenido declarado" className="sm:col-span-2" />
          <TextField id="valor_fob" label="Valor FOB (USD)" type="number" min={0} step="0.01" inputMode="decimal" />
        </FormSection>

        <FormSection title="Estado y fechas">
          <SelectField id="estado" label="Estado del envío" options={SHIPMENT_STATUSES} />
          <TextField id="fecha_recepcion" label="Fecha de recepción" type="date" />
          <TextField id="fecha_salida" label="Fecha de salida" type="date" />
          <TextField id="fecha_llegada_estimada" label="Fecha estimada de llegada" type="date" />
          <TextAreaField id="observaciones" label="Observaciones" className="sm:col-span-2" />
        </FormSection>
      </fieldset>

      <FormActions
        cancelHref="/encomiendas/listado"
        disabled={disabled}
        pending={pending}
        error={state.error}
        submitLabel="Guardar encomienda"
      />
    </form>
  )
}
