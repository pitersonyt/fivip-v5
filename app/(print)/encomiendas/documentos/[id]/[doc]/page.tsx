import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PrintToolbar } from '@/components/encomiendas/print-toolbar'
import { DeclarationDoc, GuidesDoc, LabelDoc } from '@/components/encomiendas/documents'
import { getShipmentDocument } from '@/lib/encomiendas-data'

const DOCS = {
  declaracion: { label: 'Declaración jurada', Component: DeclarationDoc },
  etiqueta: { label: 'Etiqueta y control', Component: LabelDoc },
  guias: { label: 'Guías ZOOM', Component: GuidesDoc },
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

  const { Component } = DOCS[doc]
  return (
    <>
      <PrintToolbar
        backHref="/encomiendas/listado"
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
