'use client'

import { useId, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ComputedField, TextField } from '@/components/forms/form-fields'
import { MAX_PACKAGES, VOLUMETRIC_DIVISOR, volumetricWeight } from '@/lib/encomiendas'

type PackageRow = { key: number; ancho: string; largo: string; alto: string; peso: string }
type Dimension = Exclude<keyof PackageRow, 'key'>

const format = (n: number | null) => (n === null ? '—' : n.toFixed(2))

function rowVolumetric(row: PackageRow) {
  return volumetricWeight(Number(row.ancho), Number(row.largo), Number(row.alto))
}

export function PackageList() {
  const baseId = useId()
  const [nextKey, setNextKey] = useState(1)
  const [rows, setRows] = useState<PackageRow[]>([{ key: 0, ancho: '', largo: '', alto: '', peso: '' }])

  const update = (key: number, field: Dimension) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setRows((list) => list.map((row) => (row.key === key ? { ...row, [field]: e.target.value } : row)))

  const addRow = () => {
    setRows((list) => [...list, { key: nextKey, ancho: '', largo: '', alto: '', peso: '' }])
    setNextKey((k) => k + 1)
  }

  const physicalTotal = rows.reduce((acc, r) => acc + (Number(r.peso) || 0), 0)
  const volumetricTotal = rows.reduce((acc, r) => acc + (rowVolumetric(r) ?? 0), 0)
  const hasPhysical = rows.some((r) => r.peso !== '')
  const hasVolumetric = rows.some((r) => rowVolumetric(r) !== null)
  const billable = hasPhysical || hasVolumetric ? Math.max(physicalTotal, volumetricTotal) : null

  const serialized = JSON.stringify(rows.map(({ ancho, largo, alto, peso }) => ({ ancho, largo, alto, peso })))

  return (
    <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-3">
      <input type="hidden" name="paquetes" value={serialized} />

      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const id = (field: string) => `${baseId}-${row.key}-${field}`
          return (
            <li key={row.key} className="rounded-md border border-border bg-background/60 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground">Paquete {index + 1}</h3>
                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRows((list) => list.filter((r) => r.key !== row.key))}
                    aria-label={`Quitar paquete ${index + 1}`}
                  >
                    <Trash2 aria-hidden="true" />
                    Quitar
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {(['ancho', 'largo', 'alto'] as const).map((field) => (
                  <TextField
                    key={field}
                    id={id(field)}
                    name={`${field}_${row.key}`}
                    label={`${field[0].toUpperCase()}${field.slice(1)} (cm)`}
                    type="number"
                    min={0}
                    step="0.1"
                    inputMode="decimal"
                    value={row[field]}
                    onChange={update(row.key, field)}
                  />
                ))}
                <TextField
                  id={id('peso')}
                  name={`peso_${row.key}`}
                  label="Peso físico (kg)"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  required
                  value={row.peso}
                  onChange={update(row.key, 'peso')}
                />
                <ComputedField id={id('vol')} label="Peso volumétrico" value={format(rowVolumetric(row))} />
              </div>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Button type="button" variant="outline" onClick={addRow} disabled={rows.length >= MAX_PACKAGES}>
          <Plus aria-hidden="true" />
          Agregar paquete
        </Button>
        <p className="text-xs text-muted-foreground">
          Peso volumétrico = ancho × largo × alto / {VOLUMETRIC_DIVISOR}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <ComputedField id={`${baseId}-cantidad`} label="Cantidad de paquetes" value={String(rows.length)} />
        <ComputedField id={`${baseId}-fisico`} label="Peso físico total (kg)" value={hasPhysical ? format(physicalTotal) : '—'} />
        <ComputedField
          id={`${baseId}-volumetrico`}
          label="Peso volumétrico total (kg)"
          value={hasVolumetric ? format(volumetricTotal) : '—'}
        />
        <ComputedField
          id={`${baseId}-facturable`}
          label="Peso facturable (kg)"
          value={format(billable)}
          hint="El mayor entre físico y volumétrico"
        />
      </div>
    </div>
  )
}
