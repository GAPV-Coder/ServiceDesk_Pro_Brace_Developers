'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { TicketList } from '@/components/tickets/TicketList'
import { TicketFilters } from '@/components/tickets/TicketFilters'
import { Pagination } from '@/components/common/Pagination'
import { useTickets } from '@/lib/hooks/useTickets'
import { useCategories } from '@/lib/hooks/useCategories'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import { fetchAgents } from '@/lib/store/slices/usersSlice'
import { usePermissions } from '@/lib/hooks/usePermissions'

export default function AllTicketsPage() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { canManageTickets } = usePermissions()
    const { tickets, pagination, isLoading, filters, loadTickets, updateFilters } = useTickets()
    const { categories, loadCategories } = useCategories()
    const { agents } = useAppSelector((state) => state.users)

    useEffect(() => {
        if (!canManageTickets) {
            router.push('/my-tickets')
            return
        }

        loadTickets(filters)
        loadCategories()
        dispatch(fetchAgents())
    }, [filters.page, filters.limit])

    const handleFiltersChange = (newFilters: any) => {
        updateFilters({ ...newFilters, page: 1 })
        loadTickets({ ...newFilters, page: 1 })
    }

    const handlePageChange = (page: number) => {
        updateFilters({ ...filters, page })
        loadTickets({ ...filters, page })
    }

    const handleCreateTicket = () => {
        router.push('/tickets/new')
    }

    if (!canManageTickets) {
        return null
    }

    return (
        <PageContainer>
            <PageHeader
                title="All Tickets"
                description="Manage and track all support tickets"
                action={
                    <Button onClick={handleCreateTicket} className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Ticket</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                }
            />

            <div className="space-y-4">
                <TicketFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    categories={categories}
                    agents={agents}
                />

                <TicketList
                    tickets={tickets}
                    isLoading={isLoading}
                    emptyMessage="No tickets found"
                    onCreateTicket={handleCreateTicket}
                />

                {pagination && pagination.totalPages > 1 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        className="mt-6"
                    />
                )}
            </div>
        </PageContainer>
    )
}
