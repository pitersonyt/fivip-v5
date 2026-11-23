import type { Metadata } from 'next'
import { ModulePage } from '@/components/module-page'
import { modules } from '@/lib/modules'

export const metadata: Metadata = { title: 'Movimientos bancarios' }

export default function Page() {
  return <ModulePage config={modules.bankTransactions} />
}
