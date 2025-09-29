'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { fetchAgents } from '@/lib/store/slices/usersSlice'
import { getInitials } from '@/lib/utils/formatters'

interface AssignTicketDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentAgentId?: string
    onAssign: (agentId: string) => Promise<void>
}

export function AssignTicketDialog({
    open,
    onOpenChange,
    currentAgentId,
    onAssign,
}: AssignTicketDialogProps) {
    const dispatch = useAppDispatch()
    const { agents, isLoading } = useAppSelector((state) => state.users)
    const [selectedAgentId, setSelectedAgentId] = useState(currentAgentId || '')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (open && agents.length === 0) {
            dispatch(fetchAgents())
        }
    }, [open, dispatch])

    useEffect(() => {
        setSelectedAgentId(currentAgentId || '')
    }, [currentAgentId])

    const handleAssign = async () => {
        if (!selectedAgentId) return

        setIsSubmitting(true)
        try {
            await onAssign(selectedAgentId)
            onOpenChange(false)
        } catch (error) {
            console.error('Failed to assign ticket:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Ticket</DialogTitle>
                    <DialogDescription>
                        Select an agent to assign this ticket to
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <RadioGroup value={selectedAgentId} onValueChange={setSelectedAgentId}>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {agents.map((agent) => (
                                <div
                                    key={agent.id}
                                    className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent"
                                    onClick={() => setSelectedAgentId(agent.id)}
                                >
                                    <RadioGroupItem value={agent.id} id={agent.id} />
                                    <Label htmlFor={agent.id} className="flex items-center gap-3 flex-1 cursor-pointer">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src="" alt={agent.firstName} />
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {getInitials(agent.firstName, agent.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {agent.firstName} {agent.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{agent.email}</p>
                                        </div>
                                        {agent.id === currentAgentId && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleAssign} disabled={!selectedAgentId || isSubmitting}>
                        {isSubmitting ? 'Assigning...' : 'Assign'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}