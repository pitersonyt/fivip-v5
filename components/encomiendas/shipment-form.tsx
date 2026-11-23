'use client'

import { useState } from 'react'
import { ComputedField, FormSection, SelectField, TextAreaField, TextField } from '@/components/forms/form-fields'
import { FormActions } from '@/components/forms/form-actions'
import { SHIPMENT_STATUSES, VOLUMETRIC_DIVISOR, volumetricWeight } from '@/lib/encomiendas'

export function ShipmentForm({ disabled }: { disabled: boolean }) {
  const [dims, setDims] = useState({ ancho: '', largo: '', alto: '' })
  const volumetric = volumetricWeight(Number(dims.ancho), Number(dims.largo), Number(dims.alto))

  const onDim = (key: keyof typeof dims) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDims((d) => ({ ...d, [key]: e.target.value }))

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6" aria-label="Nueva encomienda">
      <fieldset disabled={disabled} className="flex flex-col gap-6">
        <FormSection title="Remitente">
          <TextField id="remitente_nombre" label="Nombre completo" autoComplete="off" />
          <TextField id="remitente_documento" label="Documento de identidad" />
          <TextField id="remitente_telefono" label="Teléfono" type="tel" inputMode="tel" />
          <TextField id="remitente_ciudad" label="Ciudad / estado" />
        </FormSection>

        <FormSection title="Destinatario">
          <TextField id="destinatario_nombre" label="Nombre completo" autoComplete="off" />
          <TextField id="destinatario_documento" label="Documento de identidad" />
          <TextField id="destinatario_telefono" label="Teléfono" type="tel" inputMode="tel" />
          <TextField id="destinatario_ciudad" label="Ciudad / estado" />
          <TextField id="agencia_zoom" label="Agencia ZOOM" />
          <TextField id="codigo_guia" label="Código de guía" hint="Asignado por ZOOM al despachar." />
        </FormSection>

        <FormSection title="Paquetes y medidas" description="Medidas en centímetros y pesos en kilogramos.">
          <TextField id="cantidad_paquetes" label="Cantidad de paquetes" type="number" min={1} step={1} inputMode="numeric" />
          <TextField id="peso_fisico" label="Peso físico (kg)" type="number" min={0} step="0.01" inputMode="decimal" />
          <ComputedField
            id="peso_volumetrico"
            label="Peso volumétrico (kg)"
            value={volumetric === null ? '—' : volumetric.toFixed(2)}
            hint={`Ancho × largo × alto / ${VOLUMETRIC_DIVISOR}`}
          />
          <TextField id="ancho" label="Ancho (cm)" type="number" min={0} step="0.1" inputMode="decimal" value={dims.ancho} onChange={onDim('ancho')} />
          <TextField id="largo" label="Largo (cm)" type="number" min={0} step="0.1" inputMode="decimal" value={dims.largo} onChange={onDim('largo')} />
          <TextField id="alto" label="Alto (cm)" type="number" min={0} step="0.1" inputMode="decimal" value={dims.alto} onChange={onDim('alto')} />
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

      <FormActions cancelHref="/encomiendas/listado" disabled={disabled} submitLabel="Guardar encomienda" />
    </form>
  )
}
