import api from '../../client'
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../category.types'

export const categoriesService = {
    async getAll(includeInactive?: boolean): Promise<Category[]> {
        const { data } = await api.get<Category[]>('/categories', {
            params: { includeInactive },
        })
        return data
    },

    async getById(id: string): Promise<Category> {
        const { data } = await api.get<Category>(`/categories/${id}`)
        return data
    },

    async getStats(id: string): Promise<any> {
        const { data } = await api.get(`/categories/${id}/stats`)
        return data
    },

    async create(categoryData: CreateCategoryRequest): Promise<Category> {
        const { data } = await api.post<Category>('/categories', categoryData)
        return data
    },

    async update(id: string, categoryData: UpdateCategoryRequest): Promise<Category> {
        const { data } = await api.put<Category>(`/categories/${id}`, categoryData)
        return data
    },

    async activate(id: string): Promise<Category> {
        const { data } = await api.put<Category>(`/categories/${id}/activate`)
        return data
    },

    async deactivate(id: string): Promise<Category> {
        const { data } = await api.put<Category>(`/categories/${id}/deactivate`)
        return data
    },

    async reorder(categoryIds: string[]): Promise<void> {
        await api.put('/categories/reorder', { categoryIds })
    },

    async validateData(id: string, data: Record<string, any>): Promise<{
        isValid: boolean
        errors: string[]
    }> {
        const { data: result } = await api.post(`/categories/${id}/validate-data`, { data })
        return result
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/categories/${id}`)
    },
}