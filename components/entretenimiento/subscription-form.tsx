'use client'

import { useActionState, useState } from 'react'
import { ComputedField, FormSection, SelectField, TextAreaField, TextField } from '@/components/forms/form-fields'
import { FormActions } from '@/components/forms/form-actions'
import { SecretInput } from '@/components/secret-input'
import { createSubscription } from '@/app/(app)/entretenimiento/actions'
import { PLAN_DURATIONS, PLAN_TYPES, SUBSCRIPTION_STATUSES, profit } from '@/lib/entretenimiento'
import { addMonths, initialFormState } from '@/lib/form-utils'

export function SubscriptionForm({ disabled }: { disabled: boolean }) {
  const [state, formAction, pending] = useActionState(createSubscription, initialFormState)
  const [costo, setCosto] = useState('')
  const [precio, setPrecio] = useState('')
  const [inicio, setInicio] = useState('')
  const [duracion, setDuracion] = useState('')
  const [vencimiento, setVencimiento] = useState('')
  const ganancia = profit(costo, precio)

  const recalculate = (nextInicio: string, nextDuracion: string) => {
    const months = PLAN_DURATIONS.find((d) => d.label === nextDuracion)?.months
    if (nextInicio && months) setVencimiento(addMonths(nextInicio, months))
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" aria-label="Nueva suscripción">
      <fieldset disabled={disabled || pending} className="flex flex-col gap-6">
        <FormSection title="Cliente">
          <TextField id="cliente" label="Cliente" autoComplete="off" required />
          <TextField id="whatsapp" label="WhatsApp" type="tel" inputMode="tel" placeholder="+58 ..." />
          <TextField id="pais" label="País" />
        </FormSection>

        <FormSection title="Servicio y plan">
          <TextField id="producto" label="Producto / servicio" required />
          <SelectField id="tipo_plan" label="Tipo de plan" options={PLAN_TYPES} />
          <SelectField id="estado" label="Estado" options={SUBSCRIPTION_STATUSES} />
          <TextField
            id="fecha_inicio"
            label="Fecha de inicio"
            type="date"
            value={inicio}
            onChange={(e) => {
              setInicio(e.target.value)
              recalculate(e.target.value, duracion)
            }}
          />
          <SelectField
            id="duracion"
            label="Duración"
            options={PLAN_DURATIONS.map((d) => d.label)}
            value={duracion}
            onChange={(e) => {
              setDuracion(e.target.value)
              recalculate(inicio, e.target.value)
            }}
          />
          <TextField
            id="fecha_vencimiento"
            label="Fecha de vencimiento"
            type="date"
            min={inicio || undefined}
            value={vencimiento}
            onChange={(e) => setVencimiento(e.target.value)}
            hint="Se calcula con la fecha de inicio y la duración; puedes ajustarla."
          />
        </FormSection>

        <FormSection
          title="Acceso al servicio"
          description="La contraseña se mantiene oculta por defecto y se almacena cifrada."
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

      <FormActions
        cancelHref="/entretenimiento/suscripciones"
        disabled={disabled}
        pending={pending}
        error={state.error}
        submitLabel="Guardar suscripción"
      />
    </form>
  )
}
