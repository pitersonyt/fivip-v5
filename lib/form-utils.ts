export type FormState = { error: string | null }

export const initialFormState: FormState = { error: null }

export class ValidationError extends Error {}

export function text(formData: FormData, key: string, { required = false, label = key } = {}) {
  const value = String(formData.get(key) ?? '').trim()
  if (required && !value) throw new ValidationError(`El campo "${label}" es obligatorio.`)
  return value || null
}

export function amount(raw: unknown, label: string) {
  const value = String(raw ?? '').trim()
  if (!value) return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) throw new ValidationError(`"${label}" debe ser un número positivo.`)
  return Math.round(n * 100) / 100
}

export function date(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? '').trim()
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ValidationError(`"${label}" no es una fecha válida.`)
  }
  return value
}

export function oneOf<T extends readonly string[]>(formData: FormData, key: string, options: T, label: string) {
  const value = String(formData.get(key) ?? '')
  if (!value) return null
  if (!options.includes(value)) throw new ValidationError(`"${label}" tiene un valor no permitido.`)
  return value as T[number]
}

export function addMonths(isoDate: string, months: number) {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return ''
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(d, lastDay))
  return target.toISOString().slice(0, 10)
}
