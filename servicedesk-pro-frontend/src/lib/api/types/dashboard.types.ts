import { TicketStatus } from './ticket.types'

export interface DashboardMetrics {
    overview: {
        totalTickets: number
        openTickets: number
        resolvedTickets: number
        closedTickets: number
        slaBreached: number
        slaAtRisk: number
        averageResolutionTime: number
        firstResponseTime: number
    }
    ticketsByStatus: Array<{
        status: TicketStatus
        count: number
        percentage: number
    }>
    ticketsByCategory: Array<{
        categoryId: string
        categoryName: string
        count: number
        percentage: number
    }>
    ticketsByPriority: Array<{
        priority: string
        count: number
        percentage: number
    }>
    agentPerformance: Array<{
        agentId: string
        agentName: string
        assignedTickets: number
        resolvedTickets: number
        averageResolutionTime: number
        slaCompliance: number
    }>
    timeSeriesData: Array<{
        date: string
        created: number
        resolved: number
        closed: number
    }>
    slaMetrics: {
        firstResponseSLA: {
            total: number
            onTime: number
            atRisk: number
            breached: number
            compliance: number
        }
        resolutionSLA: {
            total: number
            onTime: number
            atRisk: number
            breached: number
            compliance: number
        }
    }
}

export interface DashboardQueryParams {
    period?: '7d' | '30d' | '90d'
    categoryId?: string
    agentId?: string
}