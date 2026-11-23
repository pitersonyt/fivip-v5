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

export const VOLUMETRIC_DIVISOR = 5000

export function volumetricWeight(ancho: number, largo: number, alto: number) {
  if (![ancho, largo, alto].every((n) => Number.isFinite(n) && n > 0)) return null
  return (ancho * largo * alto) / VOLUMETRIC_DIVISOR
}

export const encomiendasPanel: SectionPanelConfig = {
  title: 'Panel de Encomiendas',
  description: 'Recepción, despacho y seguimiento de paquetes enviados mediante agencias ZOOM.',
  stats: [
    { label: 'Recibidas hoy', icon: PackageCheck },
    { label: 'En tránsito', icon: Plane },
    { label: 'Pre-registros pendientes', icon: ClipboardList },
    { label: 'Entregadas (mes)', icon: CheckCircle2 },
  ],
  recent: {
    title: 'Encomiendas recientes',
    columns: [
      { label: 'Guía' },
      { label: 'Remitente' },
      { label: 'Destinatario' },
      { label: 'Destino' },
      { label: 'Peso (kg)', align: 'right' },
      { label: 'Estado' },
    ],
    emptyTitle: 'Sin encomiendas recientes',
    emptyDescription: 'Las últimas encomiendas aparecerán aquí cuando se registren.',
  },
}

const NEW_HREF = '/encomiendas/nueva'

export const encomiendasSections = {
  'pre-registros': {
    title: 'Pre-registros',
    description: 'Solicitudes registradas antes de recibir físicamente el paquete en la oficina.',
    createLabel: 'Nueva encomienda',
    createHref: NEW_HREF,
    tableTitle: 'Pre-registros',
    searchPlaceholder: 'Buscar por remitente, destinatario o teléfono',
    stats: [
      { label: 'Pendientes', icon: ClipboardList },
      { label: 'Recibidos hoy', icon: PackageCheck },
      { label: 'Paquetes esperados', icon: Package },
      { label: 'Vencidos', icon: CalendarClock },
    ],
    columns: [
      { label: 'Código' },
      { label: 'Fecha' },
      { label: 'Remitente' },
      { label: 'Teléfono' },
      { label: 'Destinatario' },
      { label: 'Ciudad / estado' },
      { label: 'Paquetes', align: 'right' },
      { label: 'Estado' },
    ],
    emptyTitle: 'No hay pre-registros',
    emptyDescription: 'Los pre-registros se listarán aquí cuando los clientes o agentes los creen.',
  },
  listado: {
    title: 'Listado de encomiendas',
    description: 'Todas las encomiendas recibidas con su estado de envío actual.',
    createLabel: 'Nueva encomienda',
    createHref: NEW_HREF,
    tableTitle: 'Encomiendas',
    searchPlaceholder: 'Buscar por guía, remitente o destinatario',
    stats: [
      { label: 'Total activas', icon: Package },
      { label: 'En tránsito', icon: Plane },
      { label: 'En agencia ZOOM', icon: Truck },
      { label: 'Entregadas (mes)', icon: CheckCircle2 },
    ],
    columns: [
      { label: 'Guía' },
      { label: 'Recepción' },
      { label: 'Remitente' },
      { label: 'Destinatario' },
      { label: 'Ciudad / estado' },
      { label: 'Agencia ZOOM' },
      { label: 'Paquetes', align: 'right' },
      { label: 'Peso (kg)', align: 'right' },
      { label: 'Estado' },
    ],
    emptyTitle: 'Aún no hay encomiendas',
    emptyDescription: 'Las encomiendas aparecerán aquí cuando Supabase esté conectado y se registre la primera.',
  },
  'guias-zoom': {
    title: 'Guías ZOOM',
    description: 'Códigos de guía asignados por ZOOM y agencias de destino.',
    createLabel: 'Asignar guía',
    tableTitle: 'Guías',
    searchPlaceholder: 'Buscar código de guía o agencia',
    stats: [
      { label: 'Guías activas', icon: Truck },
      { label: 'Sin guía asignada', icon: Tag },
      { label: 'Salidas esta semana', icon: Plane },
      { label: 'Llegadas esta semana', icon: CalendarClock },
    ],
    columns: [
      { label: 'Código de guía' },
      { label: 'Encomienda' },
      { label: 'Agencia ZOOM' },
      { label: 'Ciudad / estado' },
      { label: 'Fecha de salida' },
      { label: 'Llegada estimada' },
      { label: 'Estado' },
    ],
    emptyTitle: 'No hay guías registradas',
    emptyDescription: 'Las guías ZOOM se listarán aquí cuando se asignen a las encomiendas.',
  },
  etiquetas: {
    title: 'Etiquetas y control',
    description: 'Etiquetado por paquete, medidas, pesos y control de verificación.',
    createLabel: 'Generar etiquetas',
    tableTitle: 'Paquetes',
    searchPlaceholder: 'Buscar encomienda o etiqueta',
    stats: [
      { label: 'Por etiquetar', icon: Tag },
      { label: 'Verificados', icon: CheckCircle2 },
      { label: 'Peso físico total', icon: Scale },
      { label: 'Peso volumétrico total', icon: Package },
    ],
    columns: [
      { label: 'Encomienda' },
      { label: 'Paquete' },
      { label: 'Medidas (cm)' },
      { label: 'Peso físico', align: 'right' },
      { label: 'Peso volumétrico', align: 'right' },
      { label: 'Etiqueta' },
      { label: 'Control' },
    ],
    emptyTitle: 'No hay paquetes para etiquetar',
    emptyDescription: 'Cada paquete recibido aparecerá aquí para imprimir su etiqueta y verificarlo.',
  },
  declaraciones: {
    title: 'Declaraciones juradas',
    description: 'Declaraciones de contenido y valor FOB firmadas por el remitente.',
    createLabel: 'Nueva declaración',
    tableTitle: 'Declaraciones',
    searchPlaceholder: 'Buscar por remitente o documento',
    stats: [
      { label: 'Pendientes de firma', icon: FileSignature },
      { label: 'Firmadas (mes)', icon: CheckCircle2 },
      { label: 'Valor FOB declarado', icon: DollarSign },
      { label: 'Con observaciones', icon: ClipboardList },
    ],
    columns: [
      { label: 'Encomienda' },
      { label: 'Remitente' },
      { label: 'Documento de identidad' },
      { label: 'Contenido declarado' },
      { label: 'Valor FOB', align: 'right' },
      { label: 'Fecha' },
      { label: 'Estado' },
    ],
    emptyTitle: 'No hay declaraciones juradas',
    emptyDescription: 'Las declaraciones se generarán a partir de cada encomienda registrada.',
  },
  manifiestos: {
    title: 'Manifiestos',
    description: 'Agrupación de encomiendas por despacho para su salida y control de carga.',
    createLabel: 'Nuevo manifiesto',
    tableTitle: 'Manifiestos',
    searchPlaceholder: 'Buscar número de manifiesto',
    stats: [
      { label: 'Abiertos', icon: FileStack },
      { label: 'Despachados (mes)', icon: Plane },
      { label: 'Paquetes manifestados', icon: Package },
      { label: 'Peso total', icon: Scale },
    ],
    columns: [
      { label: 'Número' },
      { label: 'Fecha de salida' },
      { label: 'Llegada estimada' },
      { label: 'Encomiendas', align: 'right' },
      { label: 'Paquetes', align: 'right' },
      { label: 'Peso total (kg)', align: 'right' },
      { label: 'Estado' },
    ],
    emptyTitle: 'No hay manifiestos',
    emptyDescription: 'Crea un manifiesto para agrupar las encomiendas listas para despacho.',
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
