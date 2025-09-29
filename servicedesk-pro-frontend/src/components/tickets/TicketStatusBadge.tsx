import { Badge } from '@/components/ui/badge'
import { getTicketStatusColor } from '@/lib/utils/helpers'
import { getStatusLabel } from '@/lib/utils/formatters'
import type { TicketStatus } from '@/lib/api/types/ticket.types'

interface TicketStatusBadgeProps {
    status: TicketStatus
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
    return (
        <Badge className={getTicketStatusColor(status)} variant="outline">
            {getStatusLabel(status)}
        </Badge>
    )
}