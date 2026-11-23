'use client'

import { useId, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ComputedField, TextField } from '@/components/forms/form-fields'
import { MAX_PACKAGES, VOLUMETRIC_DIVISOR, billableWeight, formatKg, volumetricWeight } from '@/lib/encomiendas'

type PackageRow = { key: number; ancho: string; largo: string; alto: string; peso: string }
type Dimension = Exclude<keyof PackageRow, 'key'>

const emptyRow = (key: number): PackageRow => ({ key, ancho: '', largo: '', alto: '', peso: '' })

function measures(row: PackageRow) {
  const fisico = row.peso === '' ? null : Number(row.peso) || 0
  const volumetrico = volumetricWeight(Number(row.ancho), Number(row.largo), Number(row.alto))
  return { fisico, volumetrico, facturable: billableWeight(fisico, volumetrico) }
}

export function PackageList({
  initialCount = 1,
  onCountChange,
}: {
  initialCount?: number
  onCountChange?: (count: number) => void
}) {
  const baseId = useId()
  const start = Math.min(Math.max(initialCount, 1), MAX_PACKAGES)
  const [nextKey, setNextKey] = useState(start)
  const [rows, setRows] = useState<PackageRow[]>(() => Array.from({ length: start }, (_, i) => emptyRow(i)))

  const update = (key: number, field: Dimension) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setRows((list) => list.map((row) => (row.key === key ? { ...row, [field]: e.target.value } : row)))

  const addRow = () => {
    setRows((list) => [...list, emptyRow(nextKey)])
    setNextKey((k) => k + 1)
    onCountChange?.(rows.length + 1)
  }

  const removeRow = (key: number) => {
    setRows((list) => list.filter((r) => r.key !== key))
    onCountChange?.(rows.length - 1)
  }

  const computed = rows.map(measures)
  const total = (key: 'fisico' | 'volumetrico' | 'facturable') =>
    computed.some((m) => m[key] !== null) ? computed.reduce((acc, m) => acc + (m[key] ?? 0), 0) : null

  const serialized = JSON.stringify(rows.map(({ ancho, largo, alto, peso }) => ({ ancho, largo, alto, peso })))

  return (
    <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-3">
      <input type="hidden" name="paquetes" value={serialized} />

      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const id = (field: string) => `${baseId}-${row.key}-${field}`
          const m = computed[index]
          return (
            <li key={row.key} className="rounded-md border border-border bg-background/60 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground">Paquete {index + 1}</h3>
                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(row.key)}
                    aria-label={`Quitar paquete ${index + 1}`}
                  >
                    <Trash2 aria-hidden="true" />
                    Quitar
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {(['ancho', 'largo', 'alto'] as const).map((field) => (
                  <TextField
                    key={field}
                    id={id(field)}
                    name={`${field}_${row.key}`}
                    label={`${field[0].toUpperCase()}${field.slice(1)} cm`}
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
                  label="Peso físico kg"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  required
                  value={row.peso}
                  onChange={update(row.key, 'peso')}
                />
                <ComputedField id={id('vol')} label="Peso volumétrico" value={formatKg(m.volumetrico)} />
                <ComputedField id={id('fact')} label="Peso facturable" value={formatKg(m.facturable)} />
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
          {`Volumétrico = ancho × largo × alto / ${VOLUMETRIC_DIVISOR} · Facturable = el mayor entre físico y volumétrico`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 lg:grid-cols-4">
        <ComputedField id={`${baseId}-cantidad`} label="Cantidad de paquetes" value={String(rows.length)} />
        <ComputedField id={`${baseId}-fisico`} label="Peso físico total (kg)" value={formatKg(total('fisico'))} />
        <ComputedField
          id={`${baseId}-volumetrico`}
          label="Peso volumétrico total (kg)"
          value={formatKg(total('volumetrico'))}
        />
        <ComputedField
          id={`${baseId}-facturable`}
          label="Peso facturable total (kg)"
          value={formatKg(total('facturable'))}
        />
      </div>
    </div>
  )
}
