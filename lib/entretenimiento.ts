import {
  CalendarClock,
  CalendarX,
  CircleDollarSign,
  CreditCard,
  FlaskConical,
  History,
  KeyRound,
  MonitorSmartphone,
  Percent,
  PiggyBank,
  RefreshCcw,
  Repeat,
  TrendingUp,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react'
import type { ModuleConfig } from '@/components/module-page'
import type { SectionPanelConfig } from '@/components/section-panel'

export const PLAN_TYPES = ['1 dispositivo', 'Multi dispositivo'] as const

export const PLAN_DURATIONS = [
  { label: '1 mes', months: 1 },
  { label: '3 meses', months: 3 },
  { label: '6 meses', months: 6 },
  { label: '12 meses', months: 12 },
] as const

export const SUBSCRIPTION_STATUSES = ['Activa', 'Por vencer', 'Vencida', 'Prueba / demo', 'Suspendida', 'Cancelada'] as const

export function profit(costo: string, precio: string) {
  if (costo === '' || precio === '') return null
  const c = Number(costo)
  const p = Number(precio)
  if (!Number.isFinite(c) || !Number.isFinite(p)) return null
  return p - c
}

export const NEW_SUBSCRIPTION_HREF = '/entretenimiento/nueva-suscripcion'

export const entretenimientoPanel: SectionPanelConfig = {
  title: 'Panel de Entretenimiento',
  description: 'Clientes, cuentas y suscripciones de servicios de entretenimiento digital.',
  stats: [
    { label: 'Suscripciones activas', icon: Repeat },
    { label: 'Vencen esta semana', icon: CalendarClock },
    { label: 'Ingresos (mes)', icon: CircleDollarSign },
    { label: 'Ganancia (mes)', icon: PiggyBank },
  ],
  recent: {
    title: 'Próximos vencimientos',
    columns: [
      { label: 'Cliente' },
      { label: 'WhatsApp' },
      { label: 'Producto / servicio' },
      { label: 'Plan' },
      { label: 'Vencimiento' },
      { label: 'Estado' },
    ],
    emptyTitle: 'Sin vencimientos próximos',
    emptyDescription: 'Las suscripciones por vencer aparecerán aquí cuando existan registros.',
  },
}

export const entretenimientoSections = {
  clientes: {
    title: 'Clientes',
    description: 'Clientes de servicios de entretenimiento y sus datos de contacto.',
    createLabel: 'Nuevo cliente',
    tableTitle: 'Clientes',
    searchPlaceholder: 'Buscar por nombre, WhatsApp o país',
    stats: [
      { label: 'Total de clientes', icon: Users },
      { label: 'Con suscripción activa', icon: UserRound },
      { label: 'Nuevos (mes)', icon: UserPlus },
      { label: 'Inactivos', icon: CalendarX },
    ],
    columns: [
      { label: 'Cliente' },
      { label: 'WhatsApp' },
      { label: 'País' },
      { label: 'Suscripciones', align: 'right' },
      { label: 'Próximo vencimiento' },
      { label: 'Estado' },
    ],
    emptyTitle: 'Aún no hay clientes',
    emptyDescription: 'Los clientes aparecerán aquí cuando Supabase esté conectado y se registre el primero.',
  },
  cuentas: {
    title: 'Cuentas',
    description: 'Cuentas de servicio y credenciales de acceso asignadas a los clientes.',
    createLabel: 'Nueva cuenta',
    tableTitle: 'Cuentas de servicio',
    searchPlaceholder: 'Buscar producto o usuario de acceso',
    stats: [
      { label: 'Cuentas activas', icon: KeyRound },
      { label: '1 dispositivo', icon: MonitorSmartphone },
      { label: 'Multi dispositivo', icon: MonitorSmartphone },
      { label: 'Por vencer', icon: CalendarClock },
    ],
    columns: [
      { label: 'Producto / servicio' },
      { label: 'Usuario de acceso' },
      { label: 'Contraseña de servicio' },
      { label: 'Tipo de plan' },
      { label: 'Cliente' },
      { label: 'Vencimiento' },
      { label: 'Estado' },
    ],
    emptyTitle: 'No hay cuentas registradas',
    emptyDescription: 'Las contraseñas de servicio se mostrarán ocultas y solo podrán revelarse de forma individual.',
  },
  suscripciones: {
    title: 'Suscripciones',
    description: 'Suscripciones vigentes por cliente, servicio y tipo de plan.',
    createLabel: 'Nueva suscripción',
    createHref: NEW_SUBSCRIPTION_HREF,
    tableTitle: 'Suscripciones',
    searchPlaceholder: 'Buscar cliente o servicio',
    stats: [
      { label: 'Activas', icon: Repeat },
      { label: 'Por vencer', icon: CalendarClock },
      { label: 'Vencidas', icon: CalendarX },
      { label: 'Ingreso mensual', icon: CircleDollarSign },
    ],
    columns: [
      { label: 'Cliente' },
      { label: 'Producto / servicio' },
      { label: 'Tipo de plan' },
      { label: 'Inicio' },
      { label: 'Vencimiento' },
      { label: 'Costo', align: 'right' },
      { label: 'Precio de venta', align: 'right' },
      { label: 'Ganancia', align: 'right' },
      { label: 'Estado' },
    ],
    emptyTitle: 'Aún no hay suscripciones',
    emptyDescription: 'Registra la primera suscripción para empezar a controlar vencimientos y ganancias.',
  },
  renovaciones: {
    title: 'Renovaciones',
    description: 'Renovaciones realizadas y extensión de fechas de vencimiento.',
    createLabel: 'Registrar renovación',
    tableTitle: 'Renovaciones',
    searchPlaceholder: 'Buscar cliente o servicio',
    stats: [
      { label: 'Renovadas (mes)', icon: RefreshCcw },
      { label: 'Pendientes', icon: CalendarClock },
      { label: 'Tasa de renovación', icon: Percent },
      { label: 'Ingreso por renovación', icon: CircleDollarSign },
    ],
    columns: [
      { label: 'Fecha' },
      { label: 'Cliente' },
      { label: 'Producto / servicio' },
      { label: 'Vencimiento anterior' },
      { label: 'Nuevo vencimiento' },
      { label: 'Monto', align: 'right' },
      { label: 'Estado' },
    ],
    emptyTitle: 'No hay renovaciones',
    emptyDescription: 'Cada renovación de una suscripción quedará registrada aquí.',
  },
  vencimientos: {
    title: 'Vencimientos',
    description: 'Suscripciones próximas a vencer o vencidas para contactar al cliente.',
    createLabel: 'Exportar lista',
    tableTitle: 'Vencimientos',
    searchPlaceholder: 'Buscar cliente o WhatsApp',
    stats: [
      { label: 'Vencen hoy', icon: CalendarX },
      { label: 'Próximos 7 días', icon: CalendarClock },
      { label: 'Vencidas', icon: CalendarX },
      { label: 'Ingreso en riesgo', icon: CircleDollarSign },
    ],
    columns: [
      { label: 'Cliente' },
      { label: 'WhatsApp' },
      { label: 'Producto / servicio' },
      { label: 'Tipo de plan' },
      { label: 'Vencimiento' },
      { label: 'Días restantes', align: 'right' },
      { label: 'Estado' },
    ],
    emptyTitle: 'Sin vencimientos',
    emptyDescription: 'Las suscripciones por vencer se listarán aquí automáticamente.',
  },
  pruebas: {
    title: 'Pruebas / demos',
    description: 'Accesos de prueba entregados a potenciales clientes y su conversión.',
    createLabel: 'Nueva prueba',
    tableTitle: 'Pruebas',
    searchPlaceholder: 'Buscar cliente o servicio',
    stats: [
      { label: 'Pruebas activas', icon: FlaskConical },
      { label: 'Finalizan hoy', icon: CalendarClock },
      { label: 'Convertidas (mes)', icon: UserPlus },
      { label: 'Tasa de conversión', icon: Percent },
    ],
    columns: [
      { label: 'Cliente' },
      { label: 'WhatsApp' },
      { label: 'Producto / servicio' },
      { label: 'Inicio' },
      { label: 'Fin de prueba' },
      { label: 'Convertida' },
      { label: 'Estado' },
    ],
    emptyTitle: 'No hay pruebas registradas',
    emptyDescription: 'Las pruebas y demos entregadas aparecerán aquí.',
  },
  pagos: {
    title: 'Pagos',
    description: 'Historial de pagos recibidos por suscripciones y renovaciones.',
    createLabel: 'Registrar pago',
    tableTitle: 'Pagos',
    searchPlaceholder: 'Buscar cliente o referencia',
    stats: [
      { label: 'Cobrado hoy', icon: CreditCard },
      { label: 'Cobrado (mes)', icon: CircleDollarSign },
      { label: 'Pagos pendientes', icon: CalendarClock },
      { label: 'Ticket promedio', icon: TrendingUp },
    ],
    columns: [
      { label: 'Fecha' },
      { label: 'Cliente' },
      { label: 'Producto / servicio' },
      { label: 'Concepto' },
      { label: 'Método' },
      { label: 'Referencia' },
      { label: 'Monto', align: 'right' },
      { label: 'Estado' },
    ],
    emptyTitle: 'No hay pagos registrados',
    emptyDescription: 'Los pagos de cada cliente conformarán su historial de pagos.',
  },
  rentabilidad: {
    title: 'Rentabilidad',
    description: 'Costo, precio de venta y ganancia por producto o servicio.',
    createLabel: 'Exportar reporte',
    tableTitle: 'Rentabilidad por servicio',
    searchPlaceholder: 'Buscar producto o servicio',
    stats: [
      { label: 'Ingresos (mes)', icon: CircleDollarSign },
      { label: 'Costos (mes)', icon: CreditCard },
      { label: 'Ganancia (mes)', icon: PiggyBank },
      { label: 'Margen promedio', icon: Percent },
    ],
    columns: [
      { label: 'Producto / servicio' },
      { label: 'Suscripciones', align: 'right' },
      { label: 'Costo', align: 'right' },
      { label: 'Ingresos', align: 'right' },
      { label: 'Ganancia', align: 'right' },
      { label: 'Margen', align: 'right' },
    ],
    emptyTitle: 'Sin datos de rentabilidad',
    emptyDescription: 'La rentabilidad se calculará a partir de las suscripciones y pagos registrados.',
  },
  historial: {
    title: 'Historial de entretenimiento',
    description: 'Registro de altas, renovaciones, cambios de cuenta y pagos.',
    createLabel: 'Exportar historial',
    tableTitle: 'Eventos',
    searchPlaceholder: 'Buscar cliente o usuario',
    stats: [
      { label: 'Eventos hoy', icon: History },
      { label: 'Altas (mes)', icon: UserPlus },
      { label: 'Renovaciones (mes)', icon: RefreshCcw },
      { label: 'Cambios de cuenta', icon: KeyRound },
    ],
    columns: [
      { label: 'Fecha' },
      { label: 'Cliente' },
      { label: 'Producto / servicio' },
      { label: 'Evento' },
      { label: 'Detalle' },
      { label: 'Usuario' },
    ],
    emptyTitle: 'Sin eventos registrados',
    emptyDescription: 'Cada operación del módulo quedará registrada en este historial.',
  },
} satisfies Record<string, ModuleConfig>

export type EntretenimientoSection = keyof typeof entretenimientoSections
