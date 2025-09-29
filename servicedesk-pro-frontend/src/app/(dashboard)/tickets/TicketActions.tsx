'use client'

import { useState } from 'react'
import { MoreVertical, Edit, Trash2, UserPlus, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { AssignTicketDialog } from './AssignTicketDialog'
import { usePermissions } from '@/lib/hooks/usePermissions'
import type { Ticket } from '@/lib/api/types/ticket.types'

interface TicketActionsProps {
    ticket: Ticket
    onAssign: (agentId: string) => Promise<void>
    onResolve: () => Promise<void>
    onClose: () => Promise<void>
    onReopen: () => Promise<void>
    onDelete: () => Promise<void>
}

export function TicketActions({
    ticket,
    onAssign,
    onResolve,
    onClose,
    onReopen,
    onDelete,
}: TicketActionsProps) {
    const { canManageTickets, canEditTicket, canCloseTicket } = usePermissions()
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
    const [closeDialogOpen, setCloseDialogOpen] = useState(false)
    const [reopenDialogOpen, setReopenDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const canResolve = canManageTickets && ticket.status === 'in_progress'
    const canClose = canCloseTicket(ticket.requesterId) && ticket.status === 'resolved'
    const canReopen = canCloseTicket(ticket.requesterId) && ticket.status === 'closed'
    const canAssign = canManageTickets && ticket.status !== 'closed' && ticket.status !== 'cancelled'

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {canAssign && (
                        <DropdownMenuItem onClick={() => setAssignDialogOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Agent
                        </DropdownMenuItem>
                    )}
                    {canResolve && (
                        <DropdownMenuItem onClick={() => setResolveDialogOpen(true)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Resolved
                        </DropdownMenuItem>
                    )}
                    {canClose && (
                        <DropdownMenuItem onClick={() => setCloseDialogOpen(true)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Close Ticket
                        </DropdownMenuItem>
                    )}
                    {canReopen && (
                        <DropdownMenuItem onClick={() => setReopenDialogOpen(true)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reopen Ticket
                        </DropdownMenuItem>
                    )}
                    {canManageTickets && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setDeleteDialogOpen(true)}
                                className="text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Ticket
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AssignTicketDialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                currentAgentId={ticket.assignedAgentId}
                onAssign={onAssign}
            />

            <ConfirmDialog
                open={resolveDialogOpen}
                onOpenChange={setResolveDialogOpen}
                title="Resolve Ticket"
                description="Are you sure you want to mark this ticket as resolved? The requester will be notified."
                confirmText="Resolve"
                onConfirm={onResolve}
            />

            <ConfirmDialog
                open={closeDialogOpen}
                onOpenChange={setCloseDialogOpen}
                title="Close Ticket"
                description="Are you sure you want to close this ticket? This action confirms that the issue has been resolved."
                confirmText="Close"
                onConfirm={onClose}
            />

            <ConfirmDialog
                open={reopenDialogOpen}
                onOpenChange={setReopenDialogOpen}
                title="Reopen Ticket"
                description="Are you sure you want to reopen this ticket? It will be moved back to open status."
                confirmText="Reopen"
                onConfirm={onReopen}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Ticket"
                description="Are you sure you want to delete this ticket? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                onConfirm={onDelete}
            />
        </>
    )
}