'use client'

import { useActionState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormActions } from '@/components/forms/form-actions'
import { FormSection, SelectField, TextAreaField, TextField } from '@/components/forms/form-fields'
import { importZoomAgencies, saveZoomAgency } from '@/app/(app)/encomiendas/agencias-zoom/actions'
import { VENEZUELA_STATES } from '@/lib/encomiendas'
import { initialFormState } from '@/lib/form-utils'
import type { ZoomAgency } from '@/lib/zoom-agencias-data'

export function ZoomAgencyForm({ disabled, agency }: { disabled: boolean; agency?: ZoomAgency | null }) {
  const [state, action, pending] = useActionState(saveZoomAgency, initialFormState)
  return (
    <form action={action} className="flex flex-col gap-4" key={agency?.id ?? 'nueva'}>
      {agency && <input type="hidden" name="id" value={agency.id} />}
      <FormSection
        title={agency ? 'Editar agencia ZOOM' : 'Agregar agencia ZOOM'}
        description="Registra las oficinas ZOOM reales donde los destinatarios retiran sus encomiendas."
      >
        <SelectField
          id="estado"
          label="Estado"
          options={VENEZUELA_STATES}
          required
          defaultValue={agency?.estado ?? ''}
        />
        <TextField id="ciudad" label="Ciudad" required maxLength={80} defaultValue={agency?.ciudad} />
        <TextField
          id="nombre_agencia"
          label="Nombre de la agencia"
          required
          maxLength={150}
          defaultValue={agency?.nombre_agencia}
        />
        <TextField
          id="direccion"
          label="Dirección (opcional)"
          maxLength={300}
          defaultValue={agency?.direccion ?? undefined}
          className="sm:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="active"
            defaultChecked={agency?.active ?? true}
            className="size-4 accent-primary"
          />
          Agencia activa
        </label>
      </FormSection>
      <FormActions
        cancelHref="/encomiendas/agencias-zoom"
        disabled={disabled}
        pending={pending}
        error={state.error}
        submitLabel={agency ? 'Guardar cambios' : 'Agregar agencia'}
      />
    </form>
  )
}

export function ZoomAgencyImport({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(importZoomAgencies, initialFormState)
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormSection
        title="Importar catálogo"
        description="Pega filas desde Excel o CSV con las columnas: estado, ciudad, nombre_agencia, dirección. Las agencias que ya existen se omiten."
      >
        <TextAreaField
          id="datos"
          label="Filas del catálogo"
          rows={6}
          required
          placeholder={'estado,ciudad,nombre_agencia,direccion'}
          className="sm:col-span-2 lg:col-span-3"
        />
      </FormSection>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        {state.error && (
          <p role="alert" className="text-sm font-medium text-destructive sm:mr-auto">
            {state.error}
          </p>
        )}
        <Button type="submit" variant="outline" disabled={disabled || pending} aria-busy={pending}>
          <Upload aria-hidden="true" />
          {pending ? 'Importando…' : 'Importar agencias'}
        </Button>
      </div>
    </form>
  )
}
