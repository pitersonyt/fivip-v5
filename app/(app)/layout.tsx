import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { UserMenu } from '@/components/layout/user-menu'
import { BrandLogo } from '@/components/brand-logo'
import { SupabaseNotice } from '@/components/supabase-notice'
import { getCurrentUser } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const email = user?.email ?? null

  return (
    <div className="min-h-dvh bg-background">
      <AppSidebar email={email} />

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 lg:hidden">
        <MobileNav footer={<UserMenu email={email} />} />
        <BrandLogo />
      </header>

      <div className="lg:pl-64">
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {!isSupabaseConfigured() && <SupabaseNotice />}
          {children}
        </main>
      </div>
    </div>
  )
}
