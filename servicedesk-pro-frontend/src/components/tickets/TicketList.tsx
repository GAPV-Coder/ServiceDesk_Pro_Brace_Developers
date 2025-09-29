'use client'

import { TicketCard } from './TicketCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Ticket } from '@/lib/api/types/ticket.types'

interface TicketListProps {
    tickets: Ticket[]
    isLoading?: boolean
    emptyMessage?: string
    onCreateTicket?: () => void
}

export function TicketList({
    tickets,
    isLoading,
    emptyMessage = 'No tickets found',
    onCreateTicket
}: TicketListProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (tickets.length === 0) {
        return (
            <EmptyState
                icon={Inbox}
                title={emptyMessage}
                description="Create your first ticket to get started with ServiceDesk Pro"
                action={onCreateTicket ? {
                    label: 'Create Ticket',
                    onClick: onCreateTicket,
                } : undefined}
            />
        )
    }

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
            ))}
        </div>
    )
}