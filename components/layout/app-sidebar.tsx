import { BrandLogo } from '@/components/brand-logo'
import { NavLinks } from './nav-links'
import { UserMenu } from './user-menu'

export function AppSidebar({ email }: { email: string | null }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <BrandLogo />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <NavLinks />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <UserMenu email={email} />
      </div>
    </aside>
  )
}
