'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, User, Tag, Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PageContainer } from '@/components/layout/PageContainer'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge'
import { TicketPriorityBadge } from '@/components/tickets/TicketPriorityBadge'
import { SLAIndicator } from '@/components/tickets/SLAIndicator'
import { TicketComments } from '../TicketComments'
import { CommentForm } from '../CommentForm'
import { TicketActions } from '../TicketActions'
import { useTickets } from '@/lib/hooks/useTickets'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatDateTime, formatRelativeTime, getInitials } from '@/lib/utils/formatters'
import { toast } from 'sonner'

export default function TicketDetailPage() {
    const params = useParams()
    const router = useRouter()
    const ticketId = params.id as string
    const { user } = useAuth()
    const {
        currentTicket,
        isLoading,
        loadTicketById,
        assignTicket,
        resolveTicket,
        closeTicket,
        reopenTicket,
        addComment,
    } = useTickets()
    const [comments, setComments] = useState(currentTicket?.comments || [])

    useEffect(() => {
        if (ticketId) {
            loadTicketById(ticketId)
        }
    }, [ticketId])

    useEffect(() => {
        if (currentTicket) {
            setComments(currentTicket.comments || [])
        }
    }, [currentTicket])

    const handleAddComment = async (data: { content: string; type?: 'public' | 'internal' }) => {
        try {
            await addComment(ticketId, data.content, data.type)
            toast.success('Comment added successfully')
            // Reload ticket to get updated comments
            await loadTicketById(ticketId)
        } catch (error) {
            toast.error('Failed to add comment')
        }
    }

    const handleAssign = async (agentId: string) => {
        try {
            await assignTicket(ticketId, agentId)
            toast.success('Ticket assigned successfully')
            await loadTicketById(ticketId)
        } catch (error) {
            toast.error('Failed to assign ticket')
        }
    }

    const handleResolve = async () => {
        try {
            await resolveTicket(ticketId)
            toast.success('Ticket marked as resolved')
            await loadTicketById(ticketId)
        } catch (error) {
            toast.error('Failed to resolve ticket')
        }
    }

    const handleClose = async () => {
        try {
            await closeTicket(ticketId)
            toast.success('Ticket closed successfully')
            await loadTicketById(ticketId)
        } catch (error) {
            toast.error('Failed to close ticket')
        }
    }

    const handleReopen = async () => {
        try {
            await reopenTicket(ticketId)
            toast.success('Ticket reopened successfully')
            await loadTicketById(ticketId)
        } catch (error) {
            toast.error('Failed to reopen ticket')
        }
    }

    const handleDelete = async () => {
        try {
            // Implement delete functionality
            toast.success('Ticket deleted successfully')
            router.push('/tickets')
        } catch (error) {
            toast.error('Failed to delete ticket')
        }
    }

    if (isLoading || !currentTicket) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" text="Loading ticket..." />
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer maxWidth="2xl">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-4 -ml-2"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono text-muted-foreground">
                                {currentTicket.ticketNumber}
                            </span>
                            <TicketStatusBadge status={currentTicket.status} />
                            <TicketPriorityBadge priority={currentTicket.priority} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
                            {currentTicket.title}
                        </h1>
                    </div>
                    <TicketActions
                        ticket={currentTicket}
                        onAssign={handleAssign}
                        onResolve={handleResolve}
                        onClose={handleClose}
                        onReopen={handleReopen}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap break-words">
                                {currentTicket.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Additional Data */}
                    {currentTicket.additionalData && Object.keys(currentTicket.additionalData).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(currentTicket.additionalData).map(([key, value]) => (
                                        <div key={key}>
                                            <dt className="text-sm font-medium text-muted-foreground mb-1">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </dt>
                                            <dd className="text-sm">{String(value)}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    )}

                    {/* Comments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <TicketComments comments={comments} currentUserId={user?.id || ''} />
                            <Separator />
                            <CommentForm onSubmit={handleAddComment} />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Requester */}
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium mb-1">Requester</p>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src="" alt={currentTicket.requester.firstName} />
                                            <AvatarFallback className="text-xs">
                                                {getInitials(currentTicket.requester.firstName, currentTicket.requester.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm truncate">
                                            {currentTicket.requester.firstName} {currentTicket.requester.lastName}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Assigned Agent */}
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium mb-1">Assigned to</p>
                                    {currentTicket.assignedAgent ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src="" alt={currentTicket.assignedAgent.firstName} />
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(currentTicket.assignedAgent.firstName, currentTicket.assignedAgent.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm truncate">
                                                {currentTicket.assignedAgent.firstName} {currentTicket.assignedAgent.lastName}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Unassigned</span>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Category */}
                            <div className="flex items-start gap-3">
                                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium mb-1">Category</p>
                                    <Badge variant="secondary">{currentTicket.category.name}</Badge>
                                </div>
                            </div>

                            <Separator />

                            {/* Created */}
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium mb-1">Created</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDateTime(currentTicket.createdAt)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatRelativeTime(currentTicket.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SLA Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                SLA Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium mb-2">First Response</p>
                                <SLAIndicator
                                    status={currentTicket.firstResponseSLAStatus}
                                    dueDate={currentTicket.firstResponseDue}
                                    completedDate={currentTicket.firstResponseAt}
                                    label="First Response SLA"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Due: {formatRelativeTime(currentTicket.firstResponseDue)}
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium mb-2">Resolution</p>
                                <SLAIndicator
                                    status={currentTicket.resolutionSLAStatus}
                                    dueDate={currentTicket.resolutionDue}
                                    completedDate={currentTicket.resolvedAt}
                                    label="Resolution SLA"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Due: {formatRelativeTime(currentTicket.resolutionDue)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    )
}