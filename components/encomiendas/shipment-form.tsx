'use client'

import { useActionState, useState } from 'react'
import { FormSection } from '@/components/forms/form-fields'
import { FormActions } from '@/components/forms/form-actions'
import { PackageList } from '@/components/encomiendas/package-list'
import { ContentLines } from '@/components/encomiendas/content-lines'
import { GuideList } from '@/components/encomiendas/guide-list'
import { LogisticsFields } from '@/components/encomiendas/logistics-fields'
import { EnvCodeField, RecipientFields, SenderFields } from '@/components/encomiendas/party-fields'
import { createShipment } from '@/app/(app)/encomiendas/actions'
import type { Preregistro } from '@/lib/encomiendas-data'
import { initialFormState } from '@/lib/form-utils'

export function ShipmentForm({ disabled, preregistro }: { disabled: boolean; preregistro?: Preregistro | null }) {
  const [state, formAction, pending] = useActionState(createShipment, initialFormState)
  const initialPackages = preregistro?.cantidad_paquetes ?? 1
  const [packageCount, setPackageCount] = useState(initialPackages)
  const descriptions = (preregistro?.contenido_declarado ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  return (
    <form action={formAction} className="flex flex-col gap-6" aria-label="Nueva encomienda">
      {preregistro && <input type="hidden" name="preregistro_id" value={preregistro.id} />}
      <fieldset disabled={disabled || pending} className="flex flex-col gap-6">
        <SenderFields defaults={preregistro ?? undefined} />
        <RecipientFields
          defaults={preregistro ?? undefined}
          includeAgency={false}
          envCodeField={<EnvCodeField defaultValue={preregistro?.codigo_env} />}
        />

        <FormSection title="Paquetes" description="Medidas en centímetros y pesos en kilogramos.">
          <PackageList initialCount={initialPackages} onCountChange={setPackageCount} />
        </FormSection>

        <FormSection title="Contenido" description="Líneas de mercadería para la declaración jurada.">
          <ContentLines initialDescriptions={descriptions} initialFob={preregistro?.valor_fob} />
        </FormSection>

        <FormSection title="Guías ZOOM" description="Una o varias guías asignadas por ZOOM.">
          <GuideList packageCount={packageCount} />
        </FormSection>

        <FormSection title="Logística">
          <LogisticsFields defaultAgency={preregistro?.agencia_zoom} />
        </FormSection>
      </fieldset>

      <FormActions
        cancelHref={preregistro ? '/encomiendas/pre-registros' : '/encomiendas/listado'}
        disabled={disabled}
        pending={pending}
        error={state.error}
        submitLabel={preregistro ? 'Convertir en encomienda' : 'Guardar encomienda'}
      />
    </form>
  )
}
