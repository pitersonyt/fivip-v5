import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PrintToolbar } from '@/components/encomiendas/print-toolbar'
import { GuidesDoc } from '@/components/encomiendas/documents'
import { DeclarationDoc } from '@/components/encomiendas/official-declaration'
import { LabelDoc } from '@/components/encomiendas/official-label'
import './official.css'
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
      <style>{`@page { size: A4 ${doc === 'etiqueta' ? 'landscape' : 'portrait'}; margin: ${doc === 'guias' ? '10mm' : '0'}; }`}</style>
      <PrintToolbar
        backHref="/encomiendas/listado"
        previewTitle={preview}
        tabs={(Object.keys(DOCS) as DocKey[]).map((key) => ({
          href: `/encomiendas/documentos/${id}/${key}`,
          label: DOCS[key].label,
          active: key === doc,
        }))}
      />
      <main className={doc === 'guias' ? 'px-4 print:px-0' : 'official-preview'}>
        <Component doc={data} />
      </main>
    </>
  )
}
