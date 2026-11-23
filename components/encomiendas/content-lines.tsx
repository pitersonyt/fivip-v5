'use client'

import { useId, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TextField } from '@/components/forms/form-fields'
import { DECLARATION_LINES, MAX_CONTENT_LINES } from '@/lib/encomiendas'

type Line = { descripcion: string; marca: string; cantidad: string; valor: string }

const blank = (): Line => ({ descripcion: '', marca: '', cantidad: '', valor: '' })

const gridCols = 'grid-cols-[2rem_1fr] sm:grid-cols-[2.5rem_1fr_9rem_6rem_7rem]'

export function ContentLines({
  initialRows = [],
  initialFob,
}: {
  initialRows?: Omit<Line, 'marca'>[]
  initialFob?: number | null
}) {
  const baseId = useId()
  const [lines, setLines] = useState<Line[]>(() => {
    const seeded = initialRows.slice(0, MAX_CONTENT_LINES).map((row) => ({ ...blank(), ...row }))
    return [...seeded, ...Array.from({ length: Math.max(DECLARATION_LINES - seeded.length, 0) }, blank)]
  })

  const update = (index: number, field: keyof Line) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLines((list) => list.map((l, i) => (i === index ? { ...l, [field]: e.target.value } : l)))

  const linesTotal = lines.reduce((sum, l) => sum + (Number(l.valor) > 0 ? Number(l.valor) : 0), 0)

  return (
    <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-3">
      <input type="hidden" name="contenido" value={JSON.stringify(lines)} />

      <div className="overflow-hidden rounded-md border border-border">
        <div
          className={`hidden gap-3 bg-muted/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid ${gridCols}`}
        >
          <span>Línea</span>
          <span>Descripción y características</span>
          <span>Marca</span>
          <span className="text-right">Cantidad</span>
          <span className="text-right">Valor USD</span>
        </div>
        <ol className="divide-y divide-border">
          {lines.map((line, i) => (
            <li key={i} className={`grid items-start gap-3 px-3 py-2 sm:items-center ${gridCols}`}>
              <span className="pt-2 font-mono text-xs tabular-nums text-muted-foreground sm:pt-0">{i + 1}</span>
              <div className="grid grid-cols-2 gap-2 sm:contents">
                <label htmlFor={`${baseId}-d-${i}`} className="sr-only">{`Descripción línea ${i + 1}`}</label>
                <Input
                  id={`${baseId}-d-${i}`}
                  className="col-span-2 sm:col-span-1"
                  value={line.descripcion}
                  onChange={update(i, 'descripcion')}
                  maxLength={200}
                  placeholder={i === 0 ? 'Ej. Ropa usada de dama' : 'Descripción'}
                />
                <label htmlFor={`${baseId}-m-${i}`} className="sr-only">{`Marca línea ${i + 1}`}</label>
                <Input
                  id={`${baseId}-m-${i}`}
                  className="col-span-2 sm:col-span-1"
                  value={line.marca}
                  onChange={update(i, 'marca')}
                  maxLength={80}
                  placeholder="Marca"
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
                  placeholder="Cant."
                />
                <label htmlFor={`${baseId}-v-${i}`} className="sr-only">{`Valor USD línea ${i + 1}`}</label>
                <Input
                  id={`${baseId}-v-${i}`}
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  className="text-right tabular-nums"
                  value={line.valor}
                  onChange={update(i, 'valor')}
                  placeholder="USD"
                />
              </div>
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
          placeholder={linesTotal > 0 ? linesTotal.toFixed(2) : undefined}
          hint={
            linesTotal > 0
              ? `Suma de líneas: ${linesTotal.toFixed(2)} USD. Déjalo vacío para usar la suma.`
              : `La declaración jurada imprime al menos ${DECLARATION_LINES} líneas.`
          }
        />
      </div>
    </div>
  )
}
