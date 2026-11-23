'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { isNavItemActive, navGroups, type NavItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

const itemClass = (active: boolean) =>
  cn(
    'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-sidebar-ring',
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
  )

function NavLinkItem({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = isNavItemActive(item, pathname)
  const Icon = item.icon
  return (
    <Link href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={itemClass(active)}>
      <Icon
        aria-hidden="true"
        className={cn('size-4 shrink-0', active ? 'text-sidebar-primary' : 'text-sidebar-foreground/60')}
      />
      <span className="truncate">{item.title}</span>
      {active && <span aria-hidden="true" className="ml-auto size-1.5 shrink-0 rounded-full bg-sidebar-primary" />}
    </Link>
  )
}

function NavSection({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const sectionActive = isNavItemActive(item, pathname)
  const [open, setOpen] = useState(sectionActive)
  const expanded = open || sectionActive
  const Icon = item.icon
  const listId = `nav-section-${item.href.replace(/\W+/g, '')}`

  return (
    <>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={() => setOpen(!expanded)}
        className={cn(
          itemClass(false),
          sectionActive && 'text-sidebar-accent-foreground',
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn('size-4 shrink-0', sectionActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60')}
        />
        {item.title}
        <ChevronDown
          aria-hidden="true"
          className={cn('ml-auto size-4 shrink-0 text-sidebar-foreground/50 transition-transform', expanded && 'rotate-180')}
        />
      </button>
      <ul
        id={listId}
        hidden={!expanded}
        className="mt-0.5 ml-5 flex flex-col gap-0.5 border-l border-sidebar-border pl-2"
      >
        {item.children?.map((child) => (
          <li key={child.href}>
            <NavLinkItem item={child} pathname={pathname} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </>
  )
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Principal" className="flex flex-col gap-6">
      {navGroups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                {item.children ? (
                  <NavSection item={item} pathname={pathname} onNavigate={onNavigate} />
                ) : (
                  <NavLinkItem item={item} pathname={pathname} onNavigate={onNavigate} />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
