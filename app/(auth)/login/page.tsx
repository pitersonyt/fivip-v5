import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { LoginForm } from '@/components/auth/login-form'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-sidebar p-10 lg:flex">
        <BrandLogo />
        <div className="flex max-w-md flex-col gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-white">
            Remesas y operaciones financieras, en un solo lugar.
          </h2>
          <p className="text-pretty text-sidebar-foreground/80">
            Gestiona transferencias, agentes, tasas de cambio, cuentas bancarias y gastos desde una sola consola
            administrativa.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Solo personal autorizado
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center bg-background px-4 py-12">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="lg:hidden">
            <div className="inline-flex rounded-lg bg-sidebar px-4 py-3">
              <BrandLogo />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">Ingresa tus credenciales para acceder a FIVIP V5.</p>
          </div>
          <LoginForm configured={isSupabaseConfigured()} />
        </div>
      </main>
    </div>
  )
}
