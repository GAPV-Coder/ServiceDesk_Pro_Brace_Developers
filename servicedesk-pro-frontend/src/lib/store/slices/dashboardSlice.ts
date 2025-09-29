import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dashboardService } from '../../api/types/services/dashboard.service'
import type { DashboardMetrics, DashboardQueryParams } from '../../api/types/dashboard.types'

interface DashboardState {
    metrics: DashboardMetrics | null
    topCategories: any[]
    isLoading: boolean
    error: string | null
}

const initialState: DashboardState = {
    metrics: null,
    topCategories: [],
    isLoading: false,
    error: null,
}

export const fetchDashboardMetrics = createAsyncThunk(
    'dashboard/fetchMetrics',
    async (params: DashboardQueryParams | undefined, { rejectWithValue }) => {
        try {
            return await dashboardService.getMetrics(params)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard metrics')
        }
    }
)

export const fetchTopCategories = createAsyncThunk(
    'dashboard/fetchTopCategories',
    async (limit: number | undefined, { rejectWithValue }) => {
        try {
            return await dashboardService.getTopCategories(limit)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch top categories')
        }
    }
)

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboard: (state) => {
            state.metrics = null
            state.topCategories = []
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchDashboardMetrics.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
            state.isLoading = false
            state.metrics = action.payload
        })
        builder.addCase(fetchDashboardMetrics.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })

        builder.addCase(fetchTopCategories.fulfilled, (state, action) => {
            state.topCategories = action.payload
        })
    },
})

export const { clearDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer