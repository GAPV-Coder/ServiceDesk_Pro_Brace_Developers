import api from '../../client'
import { PaginatedResponse } from '../common.types'

export interface AuditLog {
    id: string
    action: string
    entityType: string
    entityId: string
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
    description?: string
    ipAddress?: string
    userAgent?: string
    user: any
    userId: string
    ticket?: any
    ticketId?: string
    createdAt: string
}

export interface AuditQueryParams {
    page?: number
    limit?: number
    action?: string
    entityType?: string
    entityId?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
}

export const auditService = {
    async getAll(params?: AuditQueryParams): Promise<PaginatedResponse<AuditLog>> {
        const { data } = await api.get<PaginatedResponse<AuditLog>>('/audit', { params })
        return data
    },

    async getStats(days?: number): Promise<any> {
        const { data } = await api.get('/audit/stats', { params: { days } })
        return data
    },

    async getEntityAuditTrail(entityType: string, entityId: string): Promise<AuditLog[]> {
        const { data } = await api.get<AuditLog[]>(`/audit/entity/${entityType}/${entityId}`)
        return data
    },

    async getUserActivity(userId: string, limit?: number): Promise<AuditLog[]> {
        const { data } = await api.get<AuditLog[]>(`/audit/user/${userId}`, {
            params: { limit },
        })
        return data
    },
}