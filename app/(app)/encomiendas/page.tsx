import type { Metadata } from 'next'
import Link from 'next/link'
import { PackagePlus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { SectionPanel } from '@/components/section-panel'
import { encomiendasPanel } from '@/lib/encomiendas'
import { encomiendasNav } from '@/lib/navigation'

export const metadata: Metadata = { title: 'Panel de Encomiendas' }

export default function Page() {
  return (
    <SectionPanel
      config={encomiendasPanel}
      section={encomiendasNav}
      actions={
        <Link href="/encomiendas/nueva" className={buttonVariants()}>
          <PackagePlus aria-hidden="true" />
          Nueva encomienda
        </Link>
      }
    />
  )
}
