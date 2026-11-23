'use client'

import { useState } from 'react'
import { ComputedField, FormSection, SelectField, TextAreaField, TextField } from '@/components/forms/form-fields'
import { FormActions } from '@/components/forms/form-actions'
import { SecretInput } from '@/components/secret-input'
import { PLAN_TYPES, SUBSCRIPTION_STATUSES, profit } from '@/lib/entretenimiento'

export function SubscriptionForm({ disabled }: { disabled: boolean }) {
  const [costo, setCosto] = useState('')
  const [precio, setPrecio] = useState('')
  const ganancia = profit(costo, precio)

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6" aria-label="Nueva suscripción">
      <fieldset disabled={disabled} className="flex flex-col gap-6">
        <FormSection title="Cliente">
          <TextField id="cliente" label="Cliente" autoComplete="off" />
          <TextField id="whatsapp" label="WhatsApp" type="tel" inputMode="tel" placeholder="+58 ..." />
          <TextField id="pais" label="País" />
        </FormSection>

        <FormSection title="Servicio y plan">
          <TextField id="producto" label="Producto / servicio" />
          <SelectField id="tipo_plan" label="Tipo de plan" options={PLAN_TYPES} />
          <SelectField id="estado" label="Estado" options={SUBSCRIPTION_STATUSES} />
          <TextField id="fecha_inicio" label="Fecha de inicio" type="date" />
          <TextField id="fecha_vencimiento" label="Fecha de vencimiento" type="date" />
        </FormSection>

        <FormSection
          title="Acceso al servicio"
          description="La contraseña se mantiene oculta por defecto y debe almacenarse cifrada."
        >
          <TextField id="usuario_acceso" label="Usuario de acceso" autoComplete="off" spellCheck={false} />
          <SecretInput id="contrasena_servicio" label="Contraseña de servicio" />
        </FormSection>

        <FormSection title="Precio" description="Montos en USD.">
          <TextField
            id="costo"
            label="Costo"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
          />
          <TextField
            id="precio_venta"
            label="Precio de venta"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
          <ComputedField
            id="ganancia"
            label="Ganancia"
            value={ganancia === null ? '—' : ganancia.toFixed(2)}
            hint="Precio de venta − costo"
          />
          <TextAreaField id="notas" label="Notas" className="sm:col-span-2 lg:col-span-3" />
        </FormSection>
      </fieldset>

      <FormActions cancelHref="/entretenimiento/suscripciones" disabled={disabled} submitLabel="Guardar suscripción" />
    </form>
  )
}
