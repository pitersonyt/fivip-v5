import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { SectionPanel } from '@/components/section-panel'
import { NEW_SUBSCRIPTION_HREF, entretenimientoPanel } from '@/lib/entretenimiento'
import { entretenimientoNav } from '@/lib/navigation'

export const metadata: Metadata = { title: 'Panel de Entretenimiento' }

export default function Page() {
  return (
    <SectionPanel
      config={entretenimientoPanel}
      section={entretenimientoNav}
      actions={
        <Link href={NEW_SUBSCRIPTION_HREF} className={buttonVariants()}>
          <Plus aria-hidden="true" />
          Nueva suscripción
        </Link>
      }
    />
  )
}
