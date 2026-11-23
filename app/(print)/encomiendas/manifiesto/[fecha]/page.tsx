import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PrintToolbar } from '@/components/encomiendas/print-toolbar'
import { ManifestDoc } from '@/components/encomiendas/documents'
import { getManifest } from '@/lib/encomiendas-data'

export const metadata: Metadata = { title: 'Manifiesto de carga', robots: { index: false } }

export default async function Page({ params }: PageProps<'/encomiendas/manifiesto/[fecha]'>) {
  const { fecha } = await params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) notFound()
  const { data, error } = await getManifest(fecha)
  if (error || data.rows.length === 0) notFound()

  return (
    <>
      <PrintToolbar backHref={`/encomiendas/manifiestos?fecha=${fecha}`} />
      <main className="px-4 print:px-0">
        <ManifestDoc manifest={data} />
      </main>
    </>
  )
}
