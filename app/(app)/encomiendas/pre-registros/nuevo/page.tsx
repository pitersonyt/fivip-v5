import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { PreregistroForm } from '@/components/encomiendas/preregistro-form'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Nuevo pre-registro' }

export default async function Page() {
  const supabase = await createClient()
  const { data, error } = supabase
    ? await supabase.schema('public').from('zoom_agencias')
        .select('id, estado, ciudad, nombre_agencia, direccion, active')
        .eq('active', true)
        .order('estado', { ascending: true })
        .order('ciudad', { ascending: true })
        .order('nombre_agencia', { ascending: true })
    : { data: null, error: { message: 'Supabase no está configurado en este entorno.' } }
  const agencies = data ?? []
  if (error) {
    console.error('[pre-registro] public.zoom_agencias', { count: agencies.length, error: error.message })
  } else {
    console.info('[pre-registro] public.zoom_agencias', { count: agencies.length })
  }
  return (
    <>
      <PageHeader
        title="Nuevo pre-registro"
        description="Datos del remitente, destinatario y envío antes de procesar la encomienda."
      />
      <PreregistroForm disabled={!!error} agencies={agencies} catalogError={error?.message} />
    </>
  )
}
