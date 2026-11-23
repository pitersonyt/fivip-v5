import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PrintToolbar } from '@/components/encomiendas/print-toolbar'
import { DeclarationDoc, GuidesDoc, LabelDoc } from '@/components/encomiendas/documents'
import { getShipmentDocument } from '@/lib/encomiendas-data'

const DOCS = {
  declaracion: { label: 'Declaración Jurada', preview: 'Vista previa Declaración Jurada', Component: DeclarationDoc },
  etiqueta: { label: 'Etiqueta + Control', preview: 'Vista previa Etiqueta + Control', Component: LabelDoc },
  guias: { label: 'Guías ZOOM', preview: 'Vista previa Guías ZOOM', Component: GuidesDoc },
} as const

type DocKey = keyof typeof DOCS
const isDoc = (d: string): d is DocKey => d in DOCS

export async function generateMetadata({ params }: PageProps<'/encomiendas/documentos/[id]/[doc]'>): Promise<Metadata> {
  const { doc } = await params
  return { title: isDoc(doc) ? DOCS[doc].label : 'Documento', robots: { index: false } }
}

export default async function Page({ params }: PageProps<'/encomiendas/documentos/[id]/[doc]'>) {
  const { id, doc } = await params
  if (!isDoc(doc)) notFound()
  const data = await getShipmentDocument(id)
  if (!data) notFound()

  const { Component, preview } = DOCS[doc]
  return (
    <>
      <style>{'@page { size: A4 portrait; margin: 10mm; }'}</style>
      <PrintToolbar
        backHref="/encomiendas/listado"
        previewTitle={preview}
        tabs={(Object.keys(DOCS) as DocKey[]).map((key) => ({
          href: `/encomiendas/documentos/${id}/${key}`,
          label: DOCS[key].label,
          active: key === doc,
        }))}
      />
      <main className="px-4 print:px-0">
        <Component doc={data} />
      </main>
    </>
  )
}
