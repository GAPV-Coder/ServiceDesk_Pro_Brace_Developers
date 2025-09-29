'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Ticket, FolderKanban, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/lib/hooks/usePermissions'

export function MobileNav() {
    const pathname = usePathname()
    const { canManageTickets } = usePermissions()

    const navItems = [
        {
            title: 'My Tickets',
            href: '/my-tickets',
            icon: Home,
        },
        ...(canManageTickets
            ? [
                {
                    title: 'All Tickets',
                    href: '/tickets',
                    icon: FolderKanban,
                },
            ]
            : []),
        {
            title: 'New',
            href: '/tickets/new',
            icon: Ticket,
        },
        {
            title: 'Settings',
            href: '/settings',
            icon: Settings,
        },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden">
            <div className="grid h-16 grid-cols-4 gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.title}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
