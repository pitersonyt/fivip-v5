'use client'

import { useActionState } from 'react'
import { FormSection, TextAreaField, TextField } from '@/components/forms/form-fields'
import { FormActions } from '@/components/forms/form-actions'
import {
  EnvCodeField,
  RecipientFields,
  SenderFields,
  type ZoomAgencyOption,
} from '@/components/encomiendas/party-fields'
import { createPreregistro } from '@/app/(app)/encomiendas/actions'
import { MAX_PACKAGES } from '@/lib/encomiendas'
import { initialFormState } from '@/lib/form-utils'

export function PreregistroForm({ disabled, agencies }: { disabled: boolean; agencies: ZoomAgencyOption[] }) {
  const [state, formAction, pending] = useActionState(createPreregistro, initialFormState)

  return (
    <form action={formAction} className="flex flex-col gap-6" aria-label="Nuevo pre-registro">
      <fieldset disabled={disabled || pending} className="flex flex-col gap-6">
        <SenderFields />
        <RecipientFields agencies={agencies} />
        <FormSection title="Envío">
          <EnvCodeField />
          <TextField
            id="cantidad_paquetes"
            label="Número de paquetes"
            type="number"
            min={1}
            max={MAX_PACKAGES}
            step={1}
            inputMode="numeric"
          />
          <TextField
            id="valor_fob"
            label="Valor FOB declarado (USD)"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
          />
          <TextAreaField
            id="contenido_declarado"
            label="Contenido declarado"
            className="sm:col-span-2 lg:col-span-3"
            placeholder="Una línea por artículo. Al convertir, cada línea pasa a la declaración."
            rows={4}
          />
          <TextAreaField id="observaciones" label="Observaciones" className="sm:col-span-2 lg:col-span-3" />
        </FormSection>
      </fieldset>

      <FormActions
        cancelHref="/encomiendas/pre-registros"
        disabled={disabled}
        pending={pending}
        error={state.error}
        submitLabel="Guardar pre-registro"
      />
    </form>
  )
}
