'use client'

import { useActionState, useState } from 'react'
import { FormSection } from '@/components/forms/form-fields'
import { FormActions } from '@/components/forms/form-actions'
import { PackageList } from '@/components/encomiendas/package-list'
import { ContentLines } from '@/components/encomiendas/content-lines'
import { GuideList } from '@/components/encomiendas/guide-list'
import { LogisticsFields } from '@/components/encomiendas/logistics-fields'
import {
  EnvCodeField,
  RecipientFields,
  SenderFields,
  type ZoomAgencyOption,
} from '@/components/encomiendas/party-fields'
import { createShipment } from '@/app/(app)/encomiendas/actions'
import { declarationDefaults } from '@/lib/preregistro-declaration'
import type { Preregistro } from '@/lib/encomiendas-data'
import { initialFormState } from '@/lib/form-utils'

export function ShipmentForm({
  disabled,
  preregistro,
  agencies,
}: {
  disabled: boolean
  preregistro?: Preregistro | null
  agencies: ZoomAgencyOption[]
}) {
  const [state, formAction, pending] = useActionState(createShipment, initialFormState)
  const initialPackages = preregistro?.cantidad_paquetes ?? 1
  const [packageCount, setPackageCount] = useState(initialPackages)
  const declaration = declarationDefaults(preregistro?.contenido_declarado)

  return (
    <form action={formAction} className="flex flex-col gap-6" aria-label="Nueva encomienda">
      {preregistro && <input type="hidden" name="preregistro_id" value={preregistro.id} />}
      <fieldset disabled={disabled || pending} className="flex flex-col gap-6">
        <SenderFields defaults={preregistro ?? undefined} />
        <RecipientFields
          agencies={agencies}
          defaults={preregistro ?? undefined}
          envCodeField={<EnvCodeField defaultValue={preregistro?.codigo_env} />}
        />

        <FormSection title="Paquetes" description="Medidas en centímetros y pesos en kilogramos.">
          <PackageList initialCount={initialPackages} onCountChange={setPackageCount} />
        </FormSection>

        <FormSection title="Contenido" description="Líneas de mercadería para la declaración jurada.">
          <ContentLines initialRows={declaration} initialFob={preregistro?.valor_fob} />
        </FormSection>

        <FormSection title="Guías ZOOM" description="Una o varias guías asignadas por ZOOM.">
          <GuideList packageCount={packageCount} />
        </FormSection>

        <FormSection title="Logística">
          <LogisticsFields />
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
