import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileSignature,
  FileStack,
  History,
  Package,
  PackageCheck,
  Plane,
  Scale,
  Tag,
  Truck,
} from 'lucide-react'
import type { ModuleConfig } from '@/components/module-page'
import type { SectionPanelConfig } from '@/components/section-panel'
import type { Column } from '@/components/data-table-shell'
import type { Stat } from '@/components/stat-card'

export const SHIPMENT_STATUSES = [
  'Pre-registrada',
  'Recibida',
  'En preparación',
  'Despachada',
  'En tránsito',
  'En aduana',
  'En agencia ZOOM',
  'Entregada',
  'Devuelta',
] as const

export const PREREGISTRO_STATUSES = ['Pendiente', 'Convertido', 'Anulado'] as const

export const GUIDE_STATUSES = [
  'Asignada',
  'Despachada',
  'En tránsito',
  'En agencia ZOOM',
  'Entregada',
  'Devuelta',
] as const

export const VENEZUELA_STATES = [
  'Amazonas',
  'Anzoátegui',
  'Apure',
  'Aragua',
  'Barinas',
  'Bolívar',
  'Carabobo',
  'Cojedes',
  'Delta Amacuro',
  'Distrito Capital',
  'Falcón',
  'Guárico',
  'La Guaira',
  'Lara',
  'Mérida',
  'Miranda',
  'Monagas',
  'Nueva Esparta',
  'Portuguesa',
  'Sucre',
  'Táchira',
  'Trujillo',
  'Yaracuy',
  'Zulia',
] as const

export const ORIGIN_COUNTRY = 'Perú'

export const VOLUMETRIC_DIVISOR = 5000
export const MAX_PACKAGES = 50
export const MAX_GUIDES = 20
export const DECLARATION_LINES = 6
export const MAX_CONTENT_LINES = 30
export const TRANSIT_DAYS = 7

const round2 = (n: number) => Math.round(n * 100) / 100

export function volumetricWeight(ancho: number, largo: number, alto: number) {
  if (![ancho, largo, alto].every((n) => Number.isFinite(n) && n > 0)) return null
  return round2((ancho * largo * alto) / VOLUMETRIC_DIVISOR)
}

export function billableWeight(fisico: number | null, volumetrico: number | null) {
  if (fisico === null && volumetrico === null) return null
  return round2(Math.max(fisico ?? 0, volumetrico ?? 0))
}

export type PackageMeasures = {
  peso_fisico: number | null
  peso_volumetrico: number | null
  peso_facturable: number | null
}

export function shipmentTotals(packages: PackageMeasures[]) {
  const sum = (key: keyof PackageMeasures) => round2(packages.reduce((acc, p) => acc + (p[key] ?? 0), 0))
  return {
    cantidad_paquetes: packages.length,
    peso_fisico_total: sum('peso_fisico'),
    peso_volumetrico_total: sum('peso_volumetrico'),
    peso_facturable_total: sum('peso_facturable'),
  }
}

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().slice(0, 10)
}

/**
 * FIVIP receives until Wednesday and departs on Thursday; arrival is about
 * TRANSIT_DAYS calendar days later. Packages received on Thursday or later
 * go out the following Thursday. Staff can always override the suggestion.
 */
export function suggestSchedule(fechaRecepcion: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaRecepcion)) return null
  const [y, m, d] = fechaRecepcion.split('-').map(Number)
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  const THURSDAY = 4
  const delta = (THURSDAY - weekday + 7) % 7 || 7
  const salida = addDays(fechaRecepcion, delta)
  return { fecha_salida: salida, fecha_llegada_estimada: addDays(salida, TRANSIT_DAYS) }
}

export const formatKg = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : Number(n).toFixed(2)

export const formatUsd = (n: number | null | undefined) =>
  n === null || n === undefined
    ? '—'
    : new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'USD' }).format(Number(n))

export const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export const encomiendasPanel: SectionPanelConfig = {
  title: 'Panel de Encomiendas',
  description: 'Envíos de Perú a Venezuela: pre-registro, recepción, despacho del jueves y entrega en agencias ZOOM.',
  stats: [
    { label: 'Recibidas hoy', icon: PackageCheck },
    { label: 'En tránsito', icon: Plane },
    { label: 'Pre-registros pendientes', icon: ClipboardList },
    { label: 'Entregadas (mes)', icon: CheckCircle2 },
  ],
  recent: {
    title: 'Encomiendas recientes',
    columns: [
      { label: 'Código ENV' },
      { label: 'Remitente' },
      { label: 'Destinatario' },
      { label: 'Destino' },
      { label: 'Peso facturable (kg)', align: 'right' },
      { label: 'Estado' },
    ],
    emptyTitle: 'Sin encomiendas recientes',
    emptyDescription: 'Las últimas encomiendas aparecerán aquí cuando se registren.',
  },
}

type ListPageConfig = {
  title: string
  description: string
  tableTitle: string
  stats: Stat[]
  columns: Column[]
  emptyTitle: string
  emptyDescription: string
}

export const preregistrosPage: ListPageConfig = {
  title: 'Pre-registros',
  description: 'Datos del cliente tomados antes de procesar el envío. Conviértelos en encomienda sin volver a escribirlos.',
  tableTitle: 'Pre-registros',
  stats: [
    { label: 'Pendientes', icon: ClipboardList },
    { label: 'Convertidos', icon: PackageCheck },
    { label: 'Paquetes esperados', icon: Package },
    { label: 'Valor FOB declarado', icon: DollarSign },
  ],
  columns: [
    { label: 'Código ENV' },
    { label: 'Fecha' },
    { label: 'Remitente' },
    { label: 'Destinatario' },
    { label: 'Destino' },
    { label: 'Paquetes', align: 'right' },
    { label: 'Estado' },
    { label: 'Acciones', align: 'right' },
  ],
  emptyTitle: 'No hay pre-registros',
  emptyDescription: 'Los pre-registros de los clientes aparecerán aquí para convertirlos en encomiendas.',
}

export const listadoPage: ListPageConfig = {
  title: 'Listado de encomiendas',
  description: 'Encomiendas registradas con sus documentos: declaración jurada, etiqueta y control, y guías.',
  tableTitle: 'Encomiendas',
  stats: [
    { label: 'Total activas', icon: Package },
    { label: 'En tránsito', icon: Plane },
    { label: 'En agencia ZOOM', icon: Truck },
    { label: 'Entregadas', icon: CheckCircle2 },
  ],
  columns: [
    { label: 'Código ENV' },
    { label: 'Recepción' },
    { label: 'Remitente' },
    { label: 'Destinatario' },
    { label: 'Agencia ZOOM' },
    { label: 'Paquetes', align: 'right' },
    { label: 'Facturable (kg)', align: 'right' },
    { label: 'Estado' },
    { label: 'Documentos', align: 'right' },
  ],
  emptyTitle: 'Aún no hay encomiendas',
  emptyDescription: 'Las encomiendas aparecerán aquí cuando se registre la primera.',
}

export const manifiestosPage: ListPageConfig = {
  title: 'Manifiestos',
  description: 'Manifiesto de carga generado a partir de las encomiendas registradas para cada salida.',
  tableTitle: 'Encomiendas del manifiesto',
  stats: [
    { label: 'Encomiendas', icon: FileStack },
    { label: 'Paquetes', icon: Package },
    { label: 'Peso facturable', icon: Scale },
    { label: 'Total FOB', icon: DollarSign },
  ],
  columns: [
    { label: '#' },
    { label: 'Código ENV' },
    { label: 'Remitente' },
    { label: 'Destinatario' },
    { label: 'Destino' },
    { label: 'Guías ZOOM' },
    { label: 'Paquetes', align: 'right' },
    { label: 'Facturable (kg)', align: 'right' },
    { label: 'FOB (USD)', align: 'right' },
  ],
  emptyTitle: 'Sin encomiendas para esta salida',
  emptyDescription: 'Selecciona una fecha de salida con encomiendas registradas para generar el manifiesto.',
}

export const encomiendasSections = {
  'guias-zoom': {
    title: 'Guías ZOOM',
    description: 'Guías asignadas por ZOOM a cada encomienda. Un envío puede tener una o varias guías.',
    createLabel: 'Nueva encomienda',
    createHref: '/encomiendas/nueva',
    tableTitle: 'Guías',
    searchPlaceholder: 'Buscar número de guía o código ENV',
    stats: [
      { label: 'Guías activas', icon: Truck },
      { label: 'Encomiendas multi-guía', icon: Tag },
      { label: 'Salidas esta semana', icon: Plane },
      { label: 'Llegadas esta semana', icon: CalendarClock },
    ],
    columns: [
      { label: 'Número de guía' },
      { label: 'Código ENV' },
      { label: 'Paquete' },
      { label: 'Peso (kg)', align: 'right' },
      { label: 'Agencia ZOOM' },
      { label: 'Estado' },
    ],
    emptyTitle: 'No hay guías registradas',
    emptyDescription: 'Las guías ZOOM se registran dentro de cada encomienda.',
  },
  etiquetas: {
    title: 'Etiquetas y control',
    description: 'Etiqueta + control en media página: marcas FIVIP y ZOOM, remitente, destinatario, código ENV, pesos, medidas y guías.',
    createLabel: 'Ir al listado',
    createHref: '/encomiendas/listado',
    tableTitle: 'Paquetes',
    searchPlaceholder: 'Buscar código ENV',
    stats: [
      { label: 'Por etiquetar', icon: Tag },
      { label: 'Verificados', icon: CheckCircle2 },
      { label: 'Peso físico total', icon: Scale },
      { label: 'Peso volumétrico total', icon: Package },
    ],
    columns: [
      { label: 'Código ENV' },
      { label: 'Paquete' },
      { label: 'Medidas (cm)' },
      { label: 'Peso físico', align: 'right' },
      { label: 'Peso volumétrico', align: 'right' },
      { label: 'Guía' },
      { label: 'Control' },
    ],
    emptyTitle: 'No hay paquetes para etiquetar',
    emptyDescription: 'Abre una encomienda desde el listado para imprimir su etiqueta y control.',
  },
  declaraciones: {
    title: 'Declaraciones juradas',
    description: 'Declaración jurada A4 generada desde la encomienda: remitente, destinatario, 6 líneas de mercadería y Total FOB.',
    createLabel: 'Ir al listado',
    createHref: '/encomiendas/listado',
    tableTitle: 'Declaraciones',
    searchPlaceholder: 'Buscar por remitente o código ENV',
    stats: [
      { label: 'Pendientes de revisión', icon: FileSignature },
      { label: 'Revisadas', icon: CheckCircle2 },
      { label: 'Valor FOB declarado', icon: DollarSign },
      { label: 'Con observaciones', icon: ClipboardList },
    ],
    columns: [
      { label: 'Código ENV' },
      { label: 'Remitente' },
      { label: 'Documento' },
      { label: 'Contenido' },
      { label: 'Total FOB', align: 'right' },
      { label: 'Fecha' },
      { label: 'Revisado' },
    ],
    emptyTitle: 'No hay declaraciones juradas',
    emptyDescription: 'Cada encomienda registrada genera su declaración jurada desde el listado.',
  },
  historial: {
    title: 'Historial de encomiendas',
    description: 'Registro cronológico de cambios de estado y eventos de cada encomienda.',
    createLabel: 'Exportar historial',
    tableTitle: 'Eventos',
    searchPlaceholder: 'Buscar encomienda o usuario',
    stats: [
      { label: 'Eventos hoy', icon: History },
      { label: 'Cambios de estado', icon: Truck },
      { label: 'Entregas registradas', icon: CheckCircle2 },
      { label: 'Devoluciones', icon: Package },
    ],
    columns: [
      { label: 'Fecha' },
      { label: 'Encomienda' },
      { label: 'Evento' },
      { label: 'Estado anterior' },
      { label: 'Estado nuevo' },
      { label: 'Usuario' },
      { label: 'Observaciones' },
    ],
    emptyTitle: 'Sin eventos registrados',
    emptyDescription: 'Cada cambio en una encomienda quedará registrado en este historial.',
  },
} satisfies Record<string, ModuleConfig>

export type EncomiendasSection = keyof typeof encomiendasSections
