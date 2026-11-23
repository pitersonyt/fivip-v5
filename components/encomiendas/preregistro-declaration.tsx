'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { declarationTotal, emptyRow, ROW_COUNT, type DeclarationRow } from '@/lib/preregistro-declaration'

export function PreregistroDeclaration() {
  const [rows, setRows] = useState(() => Array.from({ length: ROW_COUNT }, emptyRow))
  function control(i: number, key: keyof DeclarationRow, label: string) {
    return {
      name: `${key}_${i}`, 'aria-label': `${label}, fila ${i + 1}`, value: rows[i][key],
      required: Object.values(rows[i]).some(Boolean),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setRows(previous => previous.map((row, n) => n === i ? { ...row, [key]: value } : row))
      },
    }
  }
  return <table className="w-full table-fixed border-collapse text-sm">
    <caption className="sr-only">Declaración de hasta diez artículos. El monto corresponde a toda la fila.</caption>
    <thead className="bg-muted text-left text-xs"><tr>
      <th scope="col" className="w-1/5 px-2 py-2">PIEZAS</th><th scope="col" className="px-2 py-2">NOMBRE DEL ARTÍCULO</th><th scope="col" className="w-[28%] px-2 py-2 text-right">MONTO TOTAL USD</th>
    </tr></thead>
    <tbody>{rows.map((_, i) => <tr key={i} className="border-b border-border">
      <td className="p-1.5"><Input {...control(i, 'cantidad', 'Piezas')} type="number" step="1" min="1" max="2147483647" inputMode="numeric" /></td>
      <td className="p-1.5"><Input {...control(i, 'descripcion', 'Nombre del artículo')} maxLength={200} /></td>
      <td className="p-1.5"><Input {...control(i, 'valor', 'Monto total USD')} type="number" min="0" max="9999999999.99" step="0.01" inputMode="decimal" className="text-right tabular-nums" /></td>
    </tr>)}</tbody>
    <tfoot className="bg-muted"><tr><th scope="row" colSpan={2} className="p-3 text-right">TOTAL USD</th><td className="p-3 text-right font-semibold tabular-nums"><output aria-label="Total USD">{declarationTotal(rows).toFixed(2)}</output></td></tr></tfoot>
  </table>
}
