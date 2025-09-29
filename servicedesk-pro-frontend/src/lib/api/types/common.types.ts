export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        totalItems: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

export interface ApiError {
    statusCode: number
    message: string
    errors?: string[]
    timestamp: string
    path: string
}

export interface QueryParams {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}