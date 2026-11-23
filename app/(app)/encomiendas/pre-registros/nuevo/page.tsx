import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { PreregistroForm } from '@/components/encomiendas/preregistro-form'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = { title: 'Nuevo pre-registro' }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Nuevo pre-registro"
        description="Datos del remitente, destinatario y envío antes de procesar la encomienda."
      />
      <PreregistroForm disabled={!isSupabaseConfigured()} />
    </>
  )
}
