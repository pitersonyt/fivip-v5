import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { ShipmentForm } from '@/components/encomiendas/shipment-form'
import { getPreregistro } from '@/lib/encomiendas-data'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = { title: 'Nueva encomienda' }

export default async function Page({ searchParams }: PageProps<'/encomiendas/nueva'>) {
  const { pre } = await searchParams
  const preregistroId = typeof pre === 'string' ? pre : undefined
  const preregistro = await getPreregistro(preregistroId)
  const pendingPreregistro = preregistro?.estado === 'Pendiente' ? preregistro : null

  return (
    <>
      <PageHeader
        title="Nueva encomienda"
        description={
          pendingPreregistro
            ? `Datos cargados del pre-registro ${pendingPreregistro.codigo_env ?? ''}. Completa paquetes, contenido, guías y logística.`
            : 'Registro oficial: carga un pre-registro o registra manualmente.'
        }
        actions={
          <Link href="/encomiendas/pre-registros" className={buttonVariants({ variant: 'outline' })}>
            <ClipboardList aria-hidden="true" />
            Cargar desde pre-registro
          </Link>
        }
      />
      {preregistroId && !pendingPreregistro && (
        <p role="status" className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          El pre-registro indicado no está disponible o ya fue convertido. Puedes registrar la encomienda manualmente.
        </p>
      )}
      <ShipmentForm
        key={pendingPreregistro?.id ?? 'manual'}
        disabled={!isSupabaseConfigured()}
        preregistro={pendingPreregistro}
      />
    </>
  )
}
