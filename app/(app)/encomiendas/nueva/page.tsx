import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { ShipmentForm } from '@/components/encomiendas/shipment-form'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = { title: 'Nueva encomienda' }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Nueva encomienda"
        description="Registra remitente, destinatario, paquetes, declaración y fechas del envío."
      />
      <ShipmentForm disabled={!isSupabaseConfigured()} />
    </>
  )
}
