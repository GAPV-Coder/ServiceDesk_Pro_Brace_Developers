import { QueryParams } from './common.types'
import { Category, CategorySnapshot } from './category.types'
import { User } from './user.types'

export interface Ticket {
    id: string
    ticketNumber: string
    title: string
    description: string
    status: TicketStatus
    priority: TicketPriority
    additionalData: Record<string, any>
    firstResponseDue: string
    resolutionDue: string
    firstResponseAt?: string
    resolvedAt?: string
    firstResponseSLAStatus: SLAStatus
    resolutionSLAStatus: SLAStatus
    categorySnapshot: CategorySnapshot
    requester: User
    requesterId: string
    category: Category
    categoryId: string
    assignedAgent?: User
    assignedAgentId?: string
    comments?: TicketComment[]
    createdAt: string
    updatedAt: string
}

export interface TicketComment {
    id: string
    content: string
    type: 'public' | 'internal' | 'system'
    isFirstResponse: boolean
    ticket: Ticket
    ticketId: string
    author: User
    authorId: string
    createdAt: string
    updatedAt: string
}

export type TicketStatus =
    | 'open'
    | 'in_progress'
    | 'pending_customer'
    | 'pending_vendor'
    | 'resolved'
    | 'closed'
    | 'cancelled'

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'
export type SLAStatus = 'on_time' | 'at_risk' | 'breached'

export interface CreateTicketRequest {
    title: string
    description: string
    categoryId: string
    priority?: TicketPriority
    additionalData?: Record<string, any>
}

export interface UpdateTicketRequest {
    title?: string
    description?: string
    status?: TicketStatus
    priority?: TicketPriority
    assignedAgentId?: string
    additionalData?: Record<string, any>
}

export interface TicketQueryParams extends QueryParams {
    status?: TicketStatus
    priority?: TicketPriority
    categoryId?: string
    assignedAgentId?: string
    requesterId?: string
    slaStatus?: SLAStatus
    dateFrom?: string
    dateTo?: string
}

export interface AddCommentRequest {
    content: string
    type?: 'public' | 'internal'
}

export interface AssignTicketRequest {
    agentId: string
}