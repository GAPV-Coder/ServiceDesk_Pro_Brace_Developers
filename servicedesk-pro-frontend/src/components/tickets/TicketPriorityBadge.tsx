import { Badge } from '@/components/ui/badge'
import { getPriorityColor } from '@/lib/utils/helpers'
import { getPriorityLabel } from '@/lib/utils/formatters'
import { AlertCircle, AlertTriangle, Info, Zap } from 'lucide-react'
import type { TicketPriority } from '@/lib/api/types/ticket.types'

interface TicketPriorityBadgeProps {
    priority: TicketPriority
}

export function TicketPriorityBadge({ priority }: TicketPriorityBadgeProps) {
    const icons = {
        low: Info,
        medium: AlertCircle,
        high: AlertTriangle,
        critical: Zap,
    }

    const Icon = icons[priority]

    return (
        <Badge className={getPriorityColor(priority)} variant="outline">
            <Icon className="h-3 w-3 mr-1" />
            {getPriorityLabel(priority)}
        </Badge>
    )
}