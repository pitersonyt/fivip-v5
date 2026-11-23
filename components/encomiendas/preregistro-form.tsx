'use client'

import { useActionState, useState, type ReactNode } from 'react'
import { SelectField, TextField, Field } from '@/components/forms/form-fields'
import { FormActions } from '@/components/forms/form-actions'
import type { ZoomAgencyOption } from '@/components/encomiendas/party-fields'
import { PreregistroDeclaration } from '@/components/encomiendas/preregistro-declaration'
import { createPreregistro } from '@/app/(app)/encomiendas/actions'
import { initialFormState } from '@/lib/form-utils'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="overflow-hidden rounded-lg border border-border bg-card">
    <h2 className="bg-sidebar px-4 py-2.5 text-sm font-semibold text-sidebar-foreground">{title}</h2>{children}
  </section>
}

const options = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'es'))

function Destination({ agencies, catalogError }: { agencies: ZoomAgencyOption[]; catalogError?: string }) {
  const [estado, setEstado] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [agencyId, setAgencyId] = useState('')
  const inState = agencies.filter(a => a.estado === estado)
  const inCity = inState.filter(a => a.ciudad === ciudad)
  const selectedAgency = inCity.find(a => a.id === agencyId)
  return <>
    {catalogError && <p role="alert" className="col-span-full text-sm text-destructive">No se pudo cargar el catálogo ZOOM: {catalogError}</p>}
    <SelectField id="destinatario_estado" label="Estado" disabled={!agencies.length} required value={estado} onChange={e => { setEstado(e.target.value); setCiudad(''); setAgencyId('') }} options={options(agencies.map(a => a.estado))} placeholder={catalogError ? 'Error al cargar el catálogo' : agencies.length ? 'Seleccionar estado' : 'Sin agencias disponibles'} />
    <SelectField id="destinatario_ciudad" label="Ciudad / Zona" required disabled={!estado} value={ciudad} onChange={e => { setCiudad(e.target.value); setAgencyId('') }} options={options(inState.map(a => a.ciudad))} placeholder="Seleccionar ciudad / zona" />
    <Field id="agencia_zoom_id" label="Agencia ZOOM">
      <select name="agencia_zoom_id" id="agencia_zoom_id" required value={agencyId} onChange={e => setAgencyId(e.target.value)} disabled={!ciudad} aria-describedby={selectedAgency ? 'direccion-agencia-zoom' : undefined} className="h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm disabled:opacity-50">
        <option value="" disabled>Seleccionar agencia</option>
        {inCity.map(a => <option key={a.id} value={a.id}>{a.nombre_agencia}</option>)}
      </select>
      <div id="direccion-agencia-zoom" aria-live="polite" aria-atomic="true" className="empty:hidden text-sm text-muted-foreground">
        {selectedAgency && <><span className="block font-medium text-foreground">Dirección de la agencia ZOOM:</span>{selectedAgency.direccion?.trim() || 'No disponible en el catálogo.'}</>}
      </div>
    </Field>
  </>
}

function ContactFields({ party }: { party: 'remitente' | 'destinatario' }) {
  return <>
    <TextField id={`${party}_nombre`} label="Nombre y apellido" maxLength={500} required />
    <TextField id={`${party}_documento`} label="Cédula / Documento" maxLength={500} required />
    <TextField id={`${party}_telefono`} label="Teléfono / WhatsApp" type="tel" maxLength={500} required />
  </>
}

export function PreregistroForm({ disabled, agencies, catalogError }: { disabled: boolean; agencies: ZoomAgencyOption[]; catalogError?: string }) {
  const [state, formAction, pending] = useActionState(createPreregistro, initialFormState)
  return <form action={formAction} className="flex flex-col gap-4" aria-label="Nuevo pre-registro">
    <fieldset disabled={pending} className="flex min-w-0 flex-col gap-4">
      <Section title="1. DATOS DEL REMITENTE"><div className="grid gap-3 p-4 sm:grid-cols-2">
        <ContactFields party="remitente" /><TextField id="remitente_direccion" label="Dirección" maxLength={500} required />
      </div></Section>
      <Section title="2. DATOS DEL DESTINATARIO"><div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <ContactFields party="destinatario" /><Destination agencies={agencies} catalogError={catalogError} />
      </div></Section>
      <Section title="3. MERCANCÍA DECLARADA"><PreregistroDeclaration /></Section>
    </fieldset>
    <FormActions cancelHref="/encomiendas/pre-registros" disabled={disabled || !agencies.length} pending={pending} error={state.error} submitLabel="Guardar pre-registro" />
  </form>
}
