'use client'

import { useId, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TextField } from '@/components/forms/form-fields'
import { DECLARATION_LINES, MAX_CONTENT_LINES } from '@/lib/encomiendas'

type Line = { descripcion: string; cantidad: string }

const blank = (): Line => ({ descripcion: '', cantidad: '' })

export function ContentLines({
  initialDescriptions = [],
  initialFob,
}: {
  initialDescriptions?: string[]
  initialFob?: number | null
}) {
  const baseId = useId()
  const [lines, setLines] = useState<Line[]>(() => {
    const seeded = initialDescriptions.slice(0, MAX_CONTENT_LINES).map((d) => ({ descripcion: d, cantidad: '' }))
    return [...seeded, ...Array.from({ length: Math.max(DECLARATION_LINES - seeded.length, 0) }, blank)]
  })

  const update = (index: number, field: keyof Line) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLines((list) => list.map((l, i) => (i === index ? { ...l, [field]: e.target.value } : l)))

  return (
    <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-3">
      <input type="hidden" name="contenido" value={JSON.stringify(lines)} />

      <div className="overflow-hidden rounded-md border border-border">
        <div className="hidden grid-cols-[3rem_1fr_8rem] gap-3 bg-muted/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
          <span>Línea</span>
          <span>Descripción de la mercadería</span>
          <span className="text-right">Cantidad</span>
        </div>
        <ol className="divide-y divide-border">
          {lines.map((line, i) => (
            <li key={i} className="grid grid-cols-[2rem_1fr_5.5rem] items-center gap-3 px-3 py-2 sm:grid-cols-[3rem_1fr_8rem]">
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{i + 1}</span>
              <label htmlFor={`${baseId}-d-${i}`} className="sr-only">{`Descripción línea ${i + 1}`}</label>
              <Input
                id={`${baseId}-d-${i}`}
                value={line.descripcion}
                onChange={update(i, 'descripcion')}
                maxLength={200}
                placeholder={i === 0 ? 'Ej. Ropa usada' : undefined}
              />
              <label htmlFor={`${baseId}-c-${i}`} className="sr-only">{`Cantidad línea ${i + 1}`}</label>
              <Input
                id={`${baseId}-c-${i}`}
                type="number"
                min={0}
                step="1"
                inputMode="numeric"
                className="text-right tabular-nums"
                value={line.cantidad}
                onChange={update(i, 'cantidad')}
              />
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLines((list) => [...list, blank()])}
          disabled={lines.length >= MAX_CONTENT_LINES}
        >
          <Plus aria-hidden="true" />
          Agregar línea
        </Button>
        <TextField
          id="valor_fob"
          label="Total FOB (USD)"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          className="sm:w-56"
          defaultValue={initialFob ?? undefined}
          hint={`La declaración jurada imprime las primeras ${DECLARATION_LINES} líneas.`}
        />
      </div>
    </div>
  )
}
