import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ModulePage } from '@/components/module-page'
import { encomiendasSections, type EncomiendasSection } from '@/lib/encomiendas'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(encomiendasSections)
    .filter((section) => section !== 'guias-zoom')
    .map((section) => ({ section }))
}

function getSection(section: string) {
  return section in encomiendasSections ? encomiendasSections[section as EncomiendasSection] : null
}

export async function generateMetadata({ params }: PageProps<'/encomiendas/[section]'>): Promise<Metadata> {
  const { section } = await params
  return { title: getSection(section)?.title ?? 'Encomiendas' }
}

export default async function Page({ params }: PageProps<'/encomiendas/[section]'>) {
  const { section } = await params
  const config = getSection(section)
  if (!config) notFound()
  return <ModulePage config={config} />
}
