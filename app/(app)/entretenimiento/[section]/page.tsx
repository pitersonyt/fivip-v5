import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ModulePage } from '@/components/module-page'
import { entretenimientoSections, type EntretenimientoSection } from '@/lib/entretenimiento'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(entretenimientoSections).map((section) => ({ section }))
}

function getSection(section: string) {
  return section in entretenimientoSections ? entretenimientoSections[section as EntretenimientoSection] : null
}

export async function generateMetadata({ params }: PageProps<'/entretenimiento/[section]'>): Promise<Metadata> {
  const { section } = await params
  return { title: getSection(section)?.title ?? 'Entretenimiento' }
}

export default async function Page({ params }: PageProps<'/entretenimiento/[section]'>) {
  const { section } = await params
  const config = getSection(section)
  if (!config) notFound()
  return <ModulePage config={config} />
}
