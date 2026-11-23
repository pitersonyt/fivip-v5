import type { Metadata } from 'next'
import { ModulePage } from '@/components/module-page'
import { modules } from '@/lib/modules'

export const metadata: Metadata = { title: 'Remesas' }

export default function Page() {
  return <ModulePage config={modules.remittances} />
}
