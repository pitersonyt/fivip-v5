import { ValidationError } from './form-utils'

export const ROW_COUNT = 10
export type DeclarationRow = { cantidad: string; descripcion: string; valor: string }
export const emptyRow = (): DeclarationRow => ({ cantidad: '', descripcion: '', valor: '' })
const prefix = 'FIVIP:declaracion:v1\n'

export function declarationTotal(rows: DeclarationRow[]) {
  return rows.reduce((cents, row) => cents + Math.round(Number(row.valor) * 100), 0) / 100
}

export function collectDeclaration(form: FormData) {
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => {
    const read = (field: keyof DeclarationRow) => String(form.get(`${field}_${i}`) ?? '').trim()
    const row = { cantidad: read('cantidad'), descripcion: read('descripcion'), valor: read('valor') }
    if (!Object.values(row).some(Boolean)) return row
    if (!row.descripcion || row.descripcion.length > 200 || !/^\d+$/.test(row.cantidad) || Number(row.cantidad) < 1 || Number(row.cantidad) > 2147483647 || !/^\d{1,10}(\.\d{1,2})?$/.test(row.valor)) {
      throw new ValidationError(`Revisa la fila ${i + 1}: indica piezas enteras, nombre del artículo y monto total en USD con hasta dos decimales.`)
    }
    return row
  })
  if (!rows.some(row => row.descripcion)) throw new ValidationError('Declara al menos un artículo.')
  const total = declarationTotal(rows)
  if (total >= 1e10) throw new ValidationError('El total declarado supera el monto permitido.')
  return { contenido_declarado: prefix + JSON.stringify(rows), valor_fob: total }
}

export function declarationDefaults(stored?: string | null): DeclarationRow[] {
  if (!stored) return []
  if (stored.startsWith(prefix)) {
    try {
      const rows = JSON.parse(stored.slice(prefix.length))
      if (Array.isArray(rows) && rows.length === ROW_COUNT && rows.every(r => r && ['cantidad','descripcion','valor'].every(k => typeof r[k] === 'string'))) return rows
    } catch { /* Older declarations are plain text. */ }
  }
  return stored.split('\n').map(s => s.trim()).filter(Boolean).map(descripcion => ({ ...emptyRow(), descripcion }))
}
