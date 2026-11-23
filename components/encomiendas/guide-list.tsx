'use client'

import { useId, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, TextField } from '@/components/forms/form-fields'
import { GUIDE_STATUSES, MAX_GUIDES } from '@/lib/encomiendas'

type GuideRow = { key: number; numero_guia: string; peso: string; estado: string; paquete_numero: string }

const selectClass =
  'h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

const emptyGuide = (key: number): GuideRow => ({ key, numero_guia: '', peso: '', estado: 'Asignada', paquete_numero: '' })

export function GuideList({ packageCount }: { packageCount: number }) {
  const baseId = useId()
  const [nextKey, setNextKey] = useState(1)
  const [rows, setRows] = useState<GuideRow[]>([emptyGuide(0)])

  const update = (key: number, field: Exclude<keyof GuideRow, 'key'>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setRows((list) => list.map((r) => (r.key === key ? { ...r, [field]: e.target.value } : r)))

  const serialized = JSON.stringify(
    rows.map(({ numero_guia, peso, estado, paquete_numero }) => ({
      numero_guia,
      peso,
      estado,
      paquete_numero: Number(paquete_numero) > packageCount ? '' : paquete_numero,
    })),
  )

  return (
    <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-3">
      <input type="hidden" name="guias" value={serialized} />
      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const id = (f: string) => `${baseId}-${row.key}-${f}`
          return (
            <li key={row.key} className="rounded-md border border-border bg-background/60 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground">Guía {index + 1}</h3>
                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRows((list) => list.filter((r) => r.key !== row.key))}
                    aria-label={`Quitar guía ${index + 1}`}
                  >
                    <Trash2 aria-hidden="true" />
                    Quitar
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <TextField
                  id={id('numero')}
                  name={`guia_${row.key}`}
                  label="Número de guía ZOOM"
                  className="font-mono"
                  autoCapitalize="characters"
                  maxLength={40}
                  value={row.numero_guia}
                  onChange={update(row.key, 'numero_guia')}
                />
                <TextField
                  id={id('peso')}
                  name={`guia_peso_${row.key}`}
                  label="Peso del paquete (kg)"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={row.peso}
                  onChange={update(row.key, 'peso')}
                />
                <Field id={id('estado')} label="Estado">
                  <select id={id('estado')} className={selectClass} value={row.estado} onChange={update(row.key, 'estado')}>
                    {GUIDE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id={id('paquete')} label="Paquete asociado">
                  <select
                    id={id('paquete')}
                    className={selectClass}
                    value={Number(row.paquete_numero) > packageCount ? '' : row.paquete_numero}
                    onChange={update(row.key, 'paquete_numero')}
                  >
                    <option value="">Toda la encomienda</option>
                    {Array.from({ length: packageCount }, (_, i) => (
                      <option key={i} value={String(i + 1)}>{`Paquete ${i + 1}`}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </li>
          )
        })}
      </ol>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setRows((list) => [...list, emptyGuide(nextKey)])
            setNextKey((k) => k + 1)
          }}
          disabled={rows.length >= MAX_GUIDES}
        >
          <Plus aria-hidden="true" />
          Agregar guía
        </Button>
        <p className="text-xs text-muted-foreground">
          Normalmente 1 guía, o de 2 a 4 cuando se divide el envío. Las guías vacías no se guardan.
        </p>
      </div>
    </div>
  )
}
