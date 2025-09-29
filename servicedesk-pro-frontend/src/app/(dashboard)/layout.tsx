'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppSelector } from '@/lib/store/hooks'
// import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isLoading } = useAuth()
    const { sidebarOpen } = useAppSelector((state) => state.ui)

    // if (isLoading) {
    //     return (
    //         <div className="flex h-screen items-center justify-center">
    //             <LoadingSpinner size="lg" />
    //         </div>
    //     )
    // }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
                <Header />
                <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
                    {children}
                </main>
                <MobileNav />
            </div>
        </div>
    )
}