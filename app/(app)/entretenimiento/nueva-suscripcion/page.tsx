import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { SubscriptionForm } from '@/components/entretenimiento/subscription-form'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = { title: 'Nueva suscripción' }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Nueva suscripción"
        description="Registra cliente, servicio, plan, credenciales de acceso y precio."
      />
      <SubscriptionForm disabled={!isSupabaseConfigured()} />
    </>
  )
}
