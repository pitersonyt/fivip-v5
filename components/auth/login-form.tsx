'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { signIn, type SignInState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: SignInState = { error: null }

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {!configured && (
        <p role="status" className="rounded-md border border-chart-3/40 bg-chart-3/10 px-3 py-2 text-sm text-foreground">
          Supabase no está conectado. El inicio de sesión estará deshabilitado hasta agregar la integración.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="nombre@empresa.com" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending || !configured} className="w-full">
        {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
        Iniciar sesión
      </Button>

      {!configured && (
        <Link
          href="/dashboard"
          className="text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver vista previa del panel
        </Link>
      )}
    </form>
  )
}
