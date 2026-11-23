'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { NavLinks } from './nav-links'

export function MobileNav({ footer }: { footer: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex size-10 items-center justify-center rounded-md text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
        <span className="sr-only">Abrir navegación</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sidebar shadow-xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring"
              >
                <X className="size-5" aria-hidden="true" />
                <span className="sr-only">Cerrar navegación</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-6">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-sidebar-border p-3">{footer}</div>
          </div>
        </div>
      )}
    </>
  )
}
