'use client'

import { useActionState, useMemo, useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormActions } from '@/components/forms/form-actions'
import { FormSection, SelectField, TextField, Field } from '@/components/forms/form-fields'
import { assignGuides, changeGuideStatus, updateGuide } from '@/app/(app)/encomiendas/guias-zoom/actions'
import { ZOOM_GUIDE_FLOW, formatDate, formatKg } from '@/lib/encomiendas'
import type { AssignableShipment, GuideRecord } from '@/lib/encomiendas-data'
import { initialFormState } from '@/lib/form-utils'
import { cn } from '@/lib/utils'

const PATH = '/encomiendas/guias-zoom'
const MAX_GUIDES = 20

const selectClass =
  'h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50'

const statusOptions = (current?: string) =>
  current && !(ZOOM_GUIDE_FLOW as readonly string[]).includes(current) ? [...ZOOM_GUIDE_FLOW, current] : ZOOM_GUIDE_FLOW

const shipmentCode = (s: AssignableShipment) => s.codigo_env ?? s.codigo

function PackageSelect({ id, packages, defaultValue }: { id: string; packages: number; defaultValue?: number | null }) {
  return (
    <Field id={id} label="Paquete">
      <select id={id} name="paquete_numero" defaultValue={defaultValue ? String(defaultValue) : ''} className={selectClass}>
        <option value="">Toda la encomienda</option>
        {Array.from({ length: packages }, (_, i) => (
          <option key={i + 1} value={i + 1}>{`Paquete ${i + 1}`}</option>
        ))}
      </select>
    </Field>
  )
}

function GuideFields({
  prefix,
  packages,
  guide,
}: {
  prefix: string
  packages: number
  guide?: GuideRecord
}) {
  return (
    <>
      <TextField
        id={`${prefix}-numero`}
        name="numero_guia"
        label="Número de guía ZOOM"
        required
        maxLength={40}
        autoComplete="off"
        className="font-mono"
        defaultValue={guide?.numero_guia}
      />
      <TextField
        id={`${prefix}-peso`}
        name="peso"
        label="Peso (kg)"
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        defaultValue={guide?.peso ?? undefined}
      />
      <PackageSelect id={`${prefix}-paquete`} packages={packages} defaultValue={guide?.paquete_numero} />
      <SelectField
        id={`${prefix}-estado`}
        name="estado"
        label="Estado de la guía"
        options={statusOptions(guide?.estado)}
        defaultValue={guide?.estado ?? 'Asignada'}
      />
    </>
  )
}

function ShipmentSummary({ shipment, guides }: { shipment: AssignableShipment; guides: GuideRecord[] }) {
  const items = [
    ['Código ENV', shipmentCode(shipment)],
    ['Remitente', shipment.remitente_nombre],
    ['Destinatario', shipment.destinatario_nombre],
    ['Agencia ZOOM', shipment.agencia_zoom],
    ['Paquetes', String(shipment.cantidad_paquetes)],
    ['Peso facturable', `${formatKg(shipment.peso_facturable_total)} kg`],
  ]
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/40 p-3 sm:col-span-2 lg:col-span-3">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className={cn('font-medium text-foreground', label === 'Código ENV' && 'font-mono')}>{value || '—'}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        {guides.length
          ? `Guías ya asignadas: ${guides.map((g) => g.numero_guia).join(', ')}`
          : 'Esta encomienda aún no tiene guías ZOOM.'}
      </p>
    </div>
  )
}

export function AssignGuidesForm({
  shipments,
  guides,
  disabled,
  initialShipmentId,
}: {
  shipments: AssignableShipment[]
  guides: GuideRecord[]
  disabled: boolean
  initialShipmentId?: string
}) {
  const [state, action, pending] = useActionState(assignGuides, initialFormState)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(initialShipmentId ?? '')
  const [rows, setRows] = useState([0])
  const [nextKey, setNextKey] = useState(1)

  const selected = shipments.find((s) => s.id === selectedId)
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return shipments.slice(0, 6)
    return shipments
      .filter((s) =>
        [shipmentCode(s), s.remitente_nombre, s.destinatario_nombre].some((v) => v?.toLowerCase().includes(q)),
      )
      .slice(0, 6)
  }, [query, shipments])

  const addRow = () => {
    if (rows.length >= MAX_GUIDES) return
    setRows((r) => [...r, nextKey])
    setNextKey((k) => k + 1)
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormSection title="Asignar guía ZOOM" description="Busca la encomienda y registra una o varias guías ZOOM.">
        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="buscar-encomienda">Encomienda</Label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="buscar-encomienda"
              type="search"
              placeholder="Buscar por código ENV, remitente o destinatario"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
              autoComplete="off"
            />
          </div>
          <ul className="flex flex-col divide-y divide-border rounded-md border border-border" aria-label="Encomiendas">
            {matches.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">Sin resultados.</li>}
            {matches.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  aria-pressed={s.id === selectedId}
                  className={cn(
                    'flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none',
                    s.id === selectedId && 'bg-accent',
                  )}
                >
                  <span className="font-mono font-medium text-foreground">{shipmentCode(s)}</span>
                  <span className="text-muted-foreground">{`${s.remitente_nombre} → ${s.destinatario_nombre}`}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(s.created_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <input type="hidden" name="encomienda_id" value={selectedId} />
        {selected && (
          <ShipmentSummary shipment={selected} guides={guides.filter((g) => g.encomienda_id === selected.id)} />
        )}
      </FormSection>

      {selected && (
        <div className="flex flex-col gap-4">
          {rows.map((key, i) => (
            <section key={key} className="rounded-lg border border-border bg-card" aria-label={`Guía ${i + 1}`}>
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <h3 className="text-sm font-semibold text-foreground">{`Guía ${i + 1}`}</h3>
                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRows((r) => r.filter((k) => k !== key))}
                  >
                    <Trash2 aria-hidden="true" />
                    Quitar
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <GuideFields prefix={`guia-${key}`} packages={Math.max(1, selected.cantidad_paquetes)} />
              </div>
            </section>
          ))}
          <Button type="button" variant="outline" className="self-start" onClick={addRow} disabled={rows.length >= MAX_GUIDES}>
            <Plus aria-hidden="true" />
            Agregar otra guía
          </Button>
        </div>
      )}

      <FormActions
        cancelHref={PATH}
        disabled={disabled || !selected}
        pending={pending}
        error={state.error}
        submitLabel={rows.length > 1 ? `Guardar ${rows.length} guías` : 'Guardar guía'}
      />
    </form>
  )
}

export function EditGuideForm({
  guide,
  shipment,
  disabled,
}: {
  guide: GuideRecord
  shipment?: AssignableShipment
  disabled: boolean
}) {
  const [state, action, pending] = useActionState(updateGuide, initialFormState)
  return (
    <form action={action} className="flex flex-col gap-4" key={guide.id}>
      <input type="hidden" name="id" value={guide.id} />
      <FormSection
        title="Editar guía ZOOM"
        description={shipment ? `Encomienda ${shipmentCode(shipment)} · ${shipment.destinatario_nombre}` : undefined}
      >
        <GuideFields prefix="editar" packages={Math.max(1, shipment?.cantidad_paquetes ?? 1)} guide={guide} />
      </FormSection>
      <FormActions cancelHref={PATH} disabled={disabled} pending={pending} error={state.error} submitLabel="Guardar cambios" />
    </form>
  )
}

export function GuideStatusForm({ guide, disabled }: { guide: GuideRecord; disabled: boolean }) {
  const [state, action, pending] = useActionState(changeGuideStatus, initialFormState)
  const id = `estado-${guide.id}`
  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="id" value={guide.id} />
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="sr-only">{`Estado de la guía ${guide.numero_guia}`}</label>
        <select id={id} name="estado" defaultValue={guide.estado} className={cn(selectClass, 'h-8 w-40 text-xs')} disabled={disabled}>
          {statusOptions(guide.estado).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Button type="submit" size="sm" variant="outline" disabled={disabled || pending}>
          {pending ? 'Guardando…' : 'Cambiar'}
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="max-w-xs text-xs whitespace-normal text-destructive">
          {state.error}
        </p>
      )}
    </form>
  )
}
