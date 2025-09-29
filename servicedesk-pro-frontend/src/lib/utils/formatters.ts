import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
    return format(new Date(date), formatStr)
}

export function formatDateTime(date: string | Date): string {
    return format(new Date(date), 'PPP p')
}

export function formatRelativeTime(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDuration(hours: number): string {
    if (hours < 1) {
        return `${Math.round(hours * 60)} minutes`
    } else if (hours < 24) {
        return `${hours.toFixed(1)} hours`
    } else {
        const days = Math.floor(hours / 24)
        const remainingHours = Math.round(hours % 24)
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`
    }
}

export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        open: 'Open',
        in_progress: 'In Progress',
        pending_customer: 'Pending Customer',
        pending_vendor: 'Pending Vendor',
        resolved: 'Resolved',
        closed: 'Closed',
        cancelled: 'Cancelled',
    }
    return labels[status] || status
}

export function getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical',
    }
    return labels[priority] || priority
}

export function getSLAStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        on_time: 'On Time',
        at_risk: 'At Risk',
        breached: 'Breached',
    }
    return labels[status] || status
}

export function formatPercentage(value: number, decimals: number = 0): string {
    return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value)
}

export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return `${text.substring(0, maxLength)}...`
}
