'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Ticket,
    FolderKanban,
    Users,
    Settings,
    FileText,
    Menu,
    X,
    LogOut
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/hooks/useAuth'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/uiSlice'
import { getInitials } from '@/lib/utils/formatters'

interface NavItem {
    title: string
    href: string
    icon: React.ElementType
    badge?: string
    roles?: string[]
}

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const { canViewDashboard, canManageUsers, canManageCategories, canViewAudit } = usePermissions()
    const dispatch = useAppDispatch()
    const { sidebarOpen } = useAppSelector((state) => state.ui)

    const navItems: NavItem[] = [
        {
            title: 'My Tickets',
            href: '/my-tickets',
            icon: Ticket,
        },
        {
            title: 'All Tickets',
            href: '/tickets',
            icon: FolderKanban,
            roles: ['agent', 'manager'],
        },
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            roles: ['manager'],
        },
        {
            title: 'Categories',
            href: '/categories',
            icon: FileText,
            roles: ['manager'],
        },
        {
            title: 'Users',
            href: '/users',
            icon: Users,
            roles: ['manager'],
        },
        {
            title: 'Settings',
            href: '/settings',
            icon: Settings,
        },
    ]

    const filteredNavItems = navItems.filter((item) => {
        if (!item.roles) return true
        return item.roles.includes(user?.role || '')
    })

    const handleToggle = () => {
        dispatch(toggleSidebar())
    }

    if (!user) return null

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={handleToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-screen w-64 bg-background border-r transition-transform duration-300 ease-in-out lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <Link href="/my-tickets" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Ticket className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg">ServiceDesk Pro</span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggle}
                            className="lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {filteredNavItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) {
                                            handleToggle()
                                        }
                                    }}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                    {item.badge && (
                                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    <Separator />

                    {/* User section */}
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="" alt={user.firstName} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {getInitials(user.firstName, user.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={logout}
                            className="w-full justify-start"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    )
}