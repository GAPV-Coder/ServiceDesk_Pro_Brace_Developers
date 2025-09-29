'use client'

import { useRouter } from 'next/navigation'
import { MessageSquare, User, Calendar } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TicketStatusBadge } from './TicketStatusBadge'
import { TicketPriorityBadge } from './TicketPriorityBadge'
import { SLAIndicator } from './SLAIndicator'
import { formatRelativeTime, getInitials } from '@/lib/utils/formatters'
import type { Ticket } from '@/lib/api/types/ticket.types'

interface TicketCardProps {
    ticket: Ticket
}

export function TicketCard({ ticket }: TicketCardProps) {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/tickets/${ticket.id}`)
    }

    return (
        <Card
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
            onClick={handleClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-muted-foreground">
                                {ticket.ticketNumber}
                            </span>
                            <TicketPriorityBadge priority={ticket.priority} />
                        </div>
                        <h3 className="font-semibold text-base line-clamp-2">{ticket.title}</h3>
                    </div>
                    <TicketStatusBadge status={ticket.status} />
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                    <SLAIndicator
                        status={ticket.firstResponseSLAStatus}
                        dueDate={ticket.firstResponseDue}
                        completedDate={ticket.firstResponseAt}
                        label="First Response SLA"
                    />
                    <SLAIndicator
                        status={ticket.resolutionSLAStatus}
                        dueDate={ticket.resolutionDue}
                        completedDate={ticket.resolvedAt}
                        label="Resolution SLA"
                    />
                </div>
            </CardContent>

            <CardFooter className="pt-3 border-t">
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="hidden sm:inline">{ticket.requester.firstName} {ticket.requester.lastName}</span>
                            <span className="sm:hidden">{getInitials(ticket.requester.firstName, ticket.requester.lastName)}</span>
                        </div>
                        {ticket.assignedAgent && (
                            <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                    <AvatarImage src="" alt={ticket.assignedAgent.firstName} />
                                    <AvatarFallback className="text-[8px]">
                                        {getInitials(ticket.assignedAgent.firstName, ticket.assignedAgent.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline">{ticket.assignedAgent.firstName}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatRelativeTime(ticket.createdAt)}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}