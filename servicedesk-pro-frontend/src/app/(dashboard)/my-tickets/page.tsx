'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { TicketList } from '@/components/tickets/TicketList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTickets } from '@/lib/hooks/useTickets'
import { useAuth } from '@/lib/hooks/useAuth'
import type { TicketStatus } from '@/lib/api/types/ticket.types'

export default function MyTicketsPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { myTickets, isLoading, loadMyTickets } = useTickets()
    const [activeTab, setActiveTab] = useState<string>('all')

    useEffect(() => {
        loadMyTickets()
    }, [])

    const handleCreateTicket = () => {
        router.push('/tickets/new')
    }

    const filterTicketsByStatus = (status?: TicketStatus) => {
        if (!status) return myTickets
        return myTickets.filter((ticket) => ticket.status === status)
    }

    const openTickets = myTickets.filter((t) =>
        ['open', 'in_progress', 'pending_customer', 'pending_vendor'].includes(t.status)
    )
    const closedTickets = myTickets.filter((t) =>
        ['resolved', 'closed', 'cancelled'].includes(t.status)
    )

    return (
        <PageContainer>
            <PageHeader
                title="My Tickets"
                description="View and manage your support tickets"
                action={
                    <Button onClick={handleCreateTicket} className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Ticket</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                }
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="all">
                        All <span className="ml-1 text-xs">({myTickets.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="open">
                        Open <span className="ml-1 text-xs">({openTickets.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="closed">
                        Closed <span className="ml-1 text-xs">({closedTickets.length})</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <TicketList
                        tickets={myTickets}
                        isLoading={isLoading}
                        emptyMessage="You don't have any tickets yet"
                        onCreateTicket={handleCreateTicket}
                    />
                </TabsContent>

                <TabsContent value="open" className="space-y-4">
                    <TicketList
                        tickets={openTickets}
                        isLoading={isLoading}
                        emptyMessage="You don't have any open tickets"
                        onCreateTicket={handleCreateTicket}
                    />
                </TabsContent>

                <TabsContent value="closed" className="space-y-4">
                    <TicketList
                        tickets={closedTickets}
                        isLoading={isLoading}
                        emptyMessage="You don't have any closed tickets"
                        onCreateTicket={handleCreateTicket}
                    />
                </TabsContent>
            </Tabs>
        </PageContainer>
    )
}