import { LogOut, UserRound } from 'lucide-react'
import { signOut } from '@/app/actions/auth'

export function UserMenu({ email }: { email: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2">
      <div
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground"
      >
        <UserRound className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{email ?? 'Sesión no iniciada'}</p>
        <p className="truncate text-xs text-sidebar-foreground/60">Administrador</p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="flex size-8 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-white focus-visible:outline-2 focus-visible:outline-sidebar-ring"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span className="sr-only">Cerrar sesión</span>
        </button>
      </form>
    </div>
  )
}
