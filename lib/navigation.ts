import {
  ArrowLeftRight,
  Banknote,
  Building2,
  CalendarX,
  ClipboardList,
  CreditCard,
  FileSignature,
  FileStack,
  FlaskConical,
  Gauge,
  HandCoins,
  History,
  KeyRound,
  LayoutDashboard,
  List,
  Package,
  PackagePlus,
  PiggyBank,
  Receipt,
  RefreshCcw,
  Repeat,
  Send,
  Settings,
  Tag,
  TrendingUp,
  Truck,
  Tv,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  exact?: boolean
  children?: NavItem[]
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const encomiendasNav: NavItem = {
  title: 'Encomiendas',
  href: '/encomiendas',
  icon: Package,
  children: [
    { title: 'Panel de Encomiendas', href: '/encomiendas', icon: Gauge, exact: true },
    { title: 'Pre-registros', href: '/encomiendas/pre-registros', icon: ClipboardList },
    { title: 'Nueva encomienda', href: '/encomiendas/nueva', icon: PackagePlus },
    { title: 'Listado de encomiendas', href: '/encomiendas/listado', icon: List },
    { title: 'Guías ZOOM', href: '/encomiendas/guias-zoom', icon: Truck },
    { title: 'Etiquetas y control', href: '/encomiendas/etiquetas', icon: Tag },
    { title: 'Declaraciones juradas', href: '/encomiendas/declaraciones', icon: FileSignature },
    { title: 'Manifiestos', href: '/encomiendas/manifiestos', icon: FileStack },
    { title: 'Historial', href: '/encomiendas/historial', icon: History },
  ],
}

export const entretenimientoNav: NavItem = {
  title: 'Entretenimiento',
  href: '/entretenimiento',
  icon: Tv,
  children: [
    { title: 'Panel de Entretenimiento', href: '/entretenimiento', icon: Gauge, exact: true },
    { title: 'Clientes', href: '/entretenimiento/clientes', icon: UserRound },
    { title: 'Cuentas', href: '/entretenimiento/cuentas', icon: KeyRound },
    { title: 'Suscripciones', href: '/entretenimiento/suscripciones', icon: Repeat },
    { title: 'Renovaciones', href: '/entretenimiento/renovaciones', icon: RefreshCcw },
    { title: 'Vencimientos', href: '/entretenimiento/vencimientos', icon: CalendarX },
    { title: 'Pruebas / demos', href: '/entretenimiento/pruebas', icon: FlaskConical },
    { title: 'Pagos', href: '/entretenimiento/pagos', icon: CreditCard },
    { title: 'Rentabilidad', href: '/entretenimiento/rentabilidad', icon: PiggyBank },
    { title: 'Historial', href: '/entretenimiento/historial', icon: History },
  ],
}

export const navGroups: NavGroup[] = [
  {
    label: 'Resumen',
    items: [{ title: 'Panel principal', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operaciones',
    items: [
      { title: 'Remesas', href: '/remittances', icon: Send },
      { title: 'Deudas', href: '/debts', icon: HandCoins },
      { title: 'Tasas de cambio', href: '/exchange-rates', icon: TrendingUp },
      { title: 'Agentes', href: '/agents', icon: Users },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { title: 'Cuentas bancarias', href: '/bank-accounts', icon: Building2 },
      { title: 'Movimientos bancarios', href: '/bank-transactions', icon: ArrowLeftRight },
      { title: 'Gastos', href: '/expenses', icon: Receipt },
    ],
  },
  {
    label: 'Servicios',
    items: [encomiendasNav, entretenimientoNav],
  },
  {
    label: 'Sistema',
    items: [{ title: 'Configuración', href: '/settings', icon: Settings }],
  },
]

export function isNavItemActive(item: NavItem, pathname: string) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export const brandIcon = Banknote
