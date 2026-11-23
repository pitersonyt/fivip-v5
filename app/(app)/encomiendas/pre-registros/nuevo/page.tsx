import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { PreregistroForm } from '@/components/encomiendas/preregistro-form'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { listZoomAgencies } from '@/lib/zoom-agencias-data'

export const metadata: Metadata = { title: 'Nuevo pre-registro' }

export default async function Page() {
  const { data: agencies } = await listZoomAgencies()
  return (
    <>
      <PageHeader
        title="Nuevo pre-registro"
        description="Datos del remitente, destinatario y envío antes de procesar la encomienda."
      />
      <PreregistroForm disabled={!isSupabaseConfigured()} agencies={agencies} />
    </>
  )
}
