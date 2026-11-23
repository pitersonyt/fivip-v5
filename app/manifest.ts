import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FIVIP V5',
    short_name: 'FIVIP',
    description: 'Sistema administrativo FIVIP PRO para remesas y servicios financieros.',
    lang: 'es',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#f6f7fa',
    theme_color: '#0f1b3d',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
