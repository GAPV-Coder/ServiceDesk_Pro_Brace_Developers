export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export const TICKET_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    PENDING_CUSTOMER: 'pending_customer',
    PENDING_VENDOR: 'pending_vendor',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    CANCELLED: 'cancelled',
} as const

export const TICKET_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const

export const USER_ROLE = {
    REQUESTER: 'requester',
    AGENT: 'agent',
    MANAGER: 'manager',
} as const

export const SLA_STATUS = {
    ON_TIME: 'on_time',
    AT_RISK: 'at_risk',
    BREACHED: 'breached',
} as const

export const STATUS_COLORS = {
    [TICKET_STATUS.OPEN]: 'bg-blue-100 text-blue-800',
    [TICKET_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
    [TICKET_STATUS.PENDING_CUSTOMER]: 'bg-orange-100 text-orange-800',
    [TICKET_STATUS.PENDING_VENDOR]: 'bg-purple-100 text-purple-800',
    [TICKET_STATUS.RESOLVED]: 'bg-green-100 text-green-800',
    [TICKET_STATUS.CLOSED]: 'bg-gray-100 text-gray-800',
    [TICKET_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
}

export const PRIORITY_COLORS = {
    [TICKET_PRIORITY.LOW]: 'bg-gray-100 text-gray-800',
    [TICKET_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800',
    [TICKET_PRIORITY.HIGH]: 'bg-orange-100 text-orange-800',
    [TICKET_PRIORITY.CRITICAL]: 'bg-red-100 text-red-800',
}

export const SLA_COLORS = {
    [SLA_STATUS.ON_TIME]: 'bg-green-100 text-green-800',
    [SLA_STATUS.AT_RISK]: 'bg-yellow-100 text-yellow-800',
    [SLA_STATUS.BREACHED]: 'bg-red-100 text-red-800',
}