import api from '../../client'
import {
    Ticket,
    TicketComment,
    CreateTicketRequest,
    UpdateTicketRequest,
    TicketQueryParams,
    AddCommentRequest,
    AssignTicketRequest,
} from '../ticket.types'
import { PaginatedResponse } from '../common.types'

export const ticketsService = {
    async getAll(params?: TicketQueryParams): Promise<PaginatedResponse<Ticket>> {
        const { data } = await api.get<PaginatedResponse<Ticket>>('/tickets', { params })
        return data
    },

    async getById(id: string): Promise<Ticket> {
        const { data } = await api.get<Ticket>(`/tickets/${id}`)
        return data
    },

    async getMyTickets(status?: string): Promise<Ticket[]> {
        const { data } = await api.get<Ticket[]>('/tickets/my-tickets', {
            params: { status }
        })
        return data
    },

    async getMyStats(): Promise<any> {
        const { data } = await api.get('/tickets/my-stats')
        return data
    },

    async search(query: string, limit?: number): Promise<Ticket[]> {
        const { data } = await api.get<Ticket[]>('/tickets/search', {
            params: { q: query, limit },
        })
        return data
    },

    async create(ticketData: CreateTicketRequest): Promise<Ticket> {
        const { data } = await api.post<Ticket>('/tickets', ticketData)
        return data
    },

    async update(id: string, ticketData: UpdateTicketRequest): Promise<Ticket> {
        const { data } = await api.put<Ticket>(`/tickets/${id}`, ticketData)
        return data
    },

    async assign(id: string, assignData: AssignTicketRequest): Promise<Ticket> {
        const { data } = await api.patch<Ticket>(`/tickets/${id}/assign`, assignData)
        return data
    },

    async resolve(id: string): Promise<Ticket> {
        const { data } = await api.patch<Ticket>(`/tickets/${id}/resolve`)
        return data
    },

    async close(id: string): Promise<Ticket> {
        const { data } = await api.patch<Ticket>(`/tickets/${id}/close`)
        return data
    },

    async reopen(id: string): Promise<Ticket> {
        const { data } = await api.patch<Ticket>(`/tickets/${id}/reopen`)
        return data
    },

    async getComments(id: string): Promise<TicketComment[]> {
        const { data } = await api.get<TicketComment[]>(`/tickets/${id}/comments`)
        return data
    },

    async addComment(id: string, comment: AddCommentRequest): Promise<TicketComment> {
        const { data } = await api.post<TicketComment>(`/tickets/${id}/comments`, comment)
        return data
    },

    async bulkUpdateStatus(ticketIds: string[], status: string): Promise<void> {
        await api.patch('/tickets/bulk/status', { ticketIds, status })
    },
}