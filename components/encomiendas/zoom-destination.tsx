'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Field, TextField } from '@/components/forms/form-fields'
import { VENEZUELA_STATES } from '@/lib/encomiendas'
import type { ZoomAgency } from '@/lib/zoom-agencias-data'
import { cn } from '@/lib/utils'

const selectClass =
  'h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50'

export type ZoomDestinationDefaults = {
  destinatario_estado?: string | null
  destinatario_ciudad?: string | null
  agencia_zoom_id?: string | null
  agencia_zoom?: string | null
}

export function ZoomDestination({
  agencies,
  defaults = {},
}: {
  agencies: Pick<ZoomAgency, 'id' | 'estado' | 'ciudad' | 'nombre_agencia' | 'direccion'>[]
  defaults?: ZoomDestinationDefaults
}) {
  const defaultAgency = agencies.find((a) => a.id === defaults.agencia_zoom_id)
  const [estado, setEstado] = useState(defaultAgency?.estado ?? defaults.destinatario_estado ?? '')
  const [ciudad, setCiudad] = useState(defaultAgency?.ciudad ?? defaults.destinatario_ciudad ?? '')
  const [agencyId, setAgencyId] = useState(defaultAgency?.id ?? '')

  const estados = useMemo(() => {
    const withAgencies = new Set(agencies.map((a) => a.estado))
    const extra = [...withAgencies].filter((e) => !(VENEZUELA_STATES as readonly string[]).includes(e))
    return [...VENEZUELA_STATES, ...extra].map((e) => ({ value: e, hasAgencies: withAgencies.has(e) }))
  }, [agencies])

  const inState = agencies.filter((a) => a.estado === estado)
  const ciudades = [...new Set(inState.map((a) => a.ciudad))].sort((a, b) => a.localeCompare(b, 'es'))
  const inCity = inState.filter((a) => a.ciudad === ciudad)
  const selected = inCity.find((a) => a.id === agencyId)
  const catalogCoversState = inState.length > 0

  return (
    <>
      <Field id="destinatario_estado" label="Estado">
        <select
          id="destinatario_estado"
          name="destinatario_estado"
          required
          className={selectClass}
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value)
            setCiudad('')
            setAgencyId('')
          }}
        >
          <option value="" disabled>
            Seleccionar estado
          </option>
          {estados.map((e) => (
            <option key={e.value} value={e.value}>
              {e.hasAgencies ? e.value : `${e.value} (sin agencias en catálogo)`}
            </option>
          ))}
        </select>
      </Field>

      {catalogCoversState || !estado ? (
        <Field id="destinatario_ciudad" label="Ciudad">
          <select
            id="destinatario_ciudad"
            name="destinatario_ciudad"
            required
            disabled={!estado}
            className={selectClass}
            value={ciudad}
            onChange={(e) => {
              setCiudad(e.target.value)
              const only = inState.filter((a) => a.ciudad === e.target.value)
              setAgencyId(only.length === 1 ? only[0].id : '')
            }}
          >
            <option value="" disabled>
              {estado ? 'Seleccionar ciudad' : 'Primero elige el estado'}
            </option>
            {ciudades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <TextField
          id="destinatario_ciudad"
          label="Ciudad"
          required
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          hint="Este estado aún no tiene agencias en el catálogo."
        />
      )}

      <Field
        id="agencia_zoom_id"
        label="Agencia ZOOM"
        hint={selected?.direccion ?? undefined}
        className={cn(!catalogCoversState && estado && 'sm:col-span-2 lg:col-span-1')}
      >
        <select
          id="agencia_zoom_id"
          name="agencia_zoom_id"
          required={catalogCoversState}
          disabled={!catalogCoversState || !ciudad}
          aria-describedby={selected?.direccion ? 'agencia_zoom_id-hint' : undefined}
          className={selectClass}
          value={agencyId}
          onChange={(e) => setAgencyId(e.target.value)}
        >
          <option value="" disabled>
            {!estado
              ? 'Primero elige el estado'
              : !catalogCoversState
                ? 'Sin agencias registradas'
                : !ciudad
                  ? 'Primero elige la ciudad'
                  : 'Seleccionar agencia'}
          </option>
          {inCity.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre_agencia}
            </option>
          ))}
        </select>
      </Field>

      {agencies.length === 0 && (
        <p className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-pretty text-muted-foreground sm:col-span-2 lg:col-span-3">
          {'El catálogo de agencias ZOOM está vacío. '}
          <Link href="/encomiendas/agencias-zoom" className="font-medium text-primary underline-offset-4 hover:underline">
            Carga las agencias reales
          </Link>
          {' para seleccionarlas aquí.'}
        </p>
      )}
      {defaults.agencia_zoom && !defaultAgency && (
        <p className="text-xs text-pretty text-muted-foreground sm:col-span-2 lg:col-span-3">
          {`Agencia indicada en el pre-registro: ${defaults.agencia_zoom}. Selecciónala del catálogo.`}
        </p>
      )}
    </>
  )
}
