'use client'

import { Bell, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/uiSlice'
import { getInitials } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export function Header() {
    const { user, logout } = useAuth()
    const dispatch = useAppDispatch()
    const { sidebarOpen } = useAppSelector((state) => state.ui)

    const handleToggle = () => {
        dispatch(toggleSidebar())
    }

    if (!user) return null

    return (
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggle}
                    className="lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Search - Hidden on mobile */}
                <div className="hidden md:flex flex-1 max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tickets..."
                            className="pl-10 w-full"
                        />
                    </div>
                </div>

                <div className="flex-1 lg:hidden" />

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    {/* Mobile search button */}
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Search className="h-5 w-5" />
                    </Button>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-96 overflow-y-auto">
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                    <div className="flex items-center gap-2 w-full">
                                        <Badge variant="destructive">SLA Breach</Badge>
                                        <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                                    </div>
                                    <p className="text-sm">Ticket #SD-123 has breached SLA</p>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                    <div className="flex items-center gap-2 w-full">
                                        <Badge>New Ticket</Badge>
                                        <span className="text-xs text-muted-foreground ml-auto">4h ago</span>
                                    </div>
                                    <p className="text-sm">New ticket assigned to you</p>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center text-center">
                                View all notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src="" alt={user.firstName} />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {getInitials(user.firstName, user.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                    <Badge variant="secondary" className="w-fit mt-1">
                                        {user.role}
                                    </Badge>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-destructive">
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}