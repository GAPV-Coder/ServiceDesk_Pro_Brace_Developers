import { Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatRelativeTime, getSLAStatusLabel } from '@/lib/utils/formatters'
import { getSLAStatusColor } from '@/lib/utils/helpers'
import type { SLAStatus } from '@/lib/api/types/ticket.types'

interface SLAIndicatorProps {
    status: SLAStatus
    dueDate: string
    completedDate?: string
    label: string
}

export function SLAIndicator({ status, dueDate, completedDate, label }: SLAIndicatorProps) {
    const icons = {
        on_time: CheckCircle,
        at_risk: AlertCircle,
        breached: AlertCircle,
    }

    const Icon = icons[status]

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge className={getSLAStatusColor(status)} variant="outline">
                        <Icon className="h-3 w-3 mr-1" />
                        {getSLAStatusLabel(status)}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="text-xs space-y-1">
                        <p className="font-medium">{label}</p>
                        <p>Due: {formatRelativeTime(dueDate)}</p>
                        {completedDate && <p>Completed: {formatRelativeTime(completedDate)}</p>}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}