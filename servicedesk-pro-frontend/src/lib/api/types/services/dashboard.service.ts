import api from '../../client'
import { DashboardMetrics, DashboardQueryParams } from '../dashboard.types'

export const dashboardService = {
    async getMetrics(params?: DashboardQueryParams): Promise<DashboardMetrics> {
        const { data } = await api.get<DashboardMetrics>('/dashboard/metrics', { params })
        return data
    },

    async getTopCategories(limit?: number): Promise<any[]> {
        const { data } = await api.get('/dashboard/top-categories', {
            params: { limit },
        })
        return data
    },
}