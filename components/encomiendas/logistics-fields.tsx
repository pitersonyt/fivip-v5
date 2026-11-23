'use client'

import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SelectField, TextAreaField, TextField } from '@/components/forms/form-fields'
import { SHIPMENT_STATUSES, TRANSIT_DAYS, suggestSchedule } from '@/lib/encomiendas'

export function LogisticsFields({ defaultAgency }: { defaultAgency?: string | null }) {
  const [recepcion, setRecepcion] = useState('')
  const [salida, setSalida] = useState('')
  const [llegada, setLlegada] = useState('')

  const applySuggestion = (fecha: string, overwrite: boolean) => {
    const s = suggestSchedule(fecha)
    if (!s) return
    setSalida((cur) => (overwrite || !cur ? s.fecha_salida : cur))
    setLlegada((cur) => (overwrite || !cur ? s.fecha_llegada_estimada : cur))
  }

  return (
    <>
      <TextField
        id="fecha_recepcion"
        label="Fecha de recepción"
        type="date"
        value={recepcion}
        onChange={(e) => {
          setRecepcion(e.target.value)
          applySuggestion(e.target.value, false)
        }}
      />
      <TextField id="fecha_salida" label="Fecha de salida" type="date" value={salida} onChange={(e) => setSalida(e.target.value)} />
      <TextField
        id="fecha_llegada_estimada"
        label="Fecha estimada de llegada"
        type="date"
        value={llegada}
        onChange={(e) => setLlegada(e.target.value)}
      />
      <div className="flex flex-col gap-2 rounded-md border border-dashed border-border bg-muted/40 p-3 sm:col-span-2 lg:col-span-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-pretty text-muted-foreground">
          {`Calendario FIVIP: recepción hasta el miércoles, salida el jueves y llegada aproximada en ${TRANSIT_DAYS} días. Las fechas se pueden editar.`}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!recepcion}
          onClick={() => applySuggestion(recepcion, true)}
        >
          <CalendarClock aria-hidden="true" />
          Recalcular fechas
        </Button>
      </div>
      <SelectField id="estado" label="Estado de encomienda" options={SHIPMENT_STATUSES} defaultValue="Recibida" />
      <TextField id="agencia_zoom" label="Agencia ZOOM destino" defaultValue={defaultAgency ?? undefined} />
      <TextAreaField id="observaciones" label="Observaciones" className="sm:col-span-2 lg:col-span-3" />
    </>
  )
}
