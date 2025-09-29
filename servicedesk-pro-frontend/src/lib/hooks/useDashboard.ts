import { useAppSelector, useAppDispatch } from '../store/hooks'
import { fetchDashboardMetrics, fetchTopCategories } from '../store/slices/dashboardSlice'
import type { DashboardQueryParams } from '../api/types/dashboard.types'

export function useDashboard() {
    const dispatch = useAppDispatch()
    const { metrics, topCategories, isLoading, error } = useAppSelector(
        (state) => state.dashboard
    )

    const loadMetrics = (params?: DashboardQueryParams) => {
        dispatch(fetchDashboardMetrics(params))
    }

    const loadTopCategories = (limit?: number) => {
        dispatch(fetchTopCategories(limit))
    }

    return {
        metrics,
        topCategories,
        isLoading,
        error,
        loadMetrics,
        loadTopCategories,
    }
}