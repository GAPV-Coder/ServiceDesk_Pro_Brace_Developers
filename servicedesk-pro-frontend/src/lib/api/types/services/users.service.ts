import api from '../../client'
import { User, CreateUserRequest, UpdateUserRequest, UserQueryParams } from '../user.types'
import { PaginatedResponse } from '../common.types'

export const usersService = {
    async getAll(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
        const { data } = await api.get<PaginatedResponse<User>>('/users', { params })
        return data
    },

    async getById(id: string): Promise<User> {
        const { data } = await api.get<User>(`/users/${id}`)
        return data
    },

    async getAgents(): Promise<User[]> {
        const { data } = await api.get<User[]>('/users/agents')
        return data
    },

    async getDepartments(): Promise<string[]> {
        const { data } = await api.get<string[]>('/users/departments')
        return data
    },

    async search(query: string, roles?: string): Promise<User[]> {
        const { data } = await api.get<User[]>('/users/search', {
            params: { q: query, roles },
        })
        return data
    },

    async getProfile(): Promise<User> {
        const { data } = await api.get<User>('/users/me')
        return data
    },

    async getStats(id: string): Promise<any> {
        const { data } = await api.get(`/users/${id}/stats`)
        return data
    },

    async create(userData: CreateUserRequest): Promise<User> {
        const { data } = await api.post<User>('/users', userData)
        return data
    },

    async update(id: string, userData: UpdateUserRequest): Promise<User> {
        const { data } = await api.put<User>(`/users/${id}`, userData)
        return data
    },

    async changeRole(id: string, role: string): Promise<User> {
        const { data } = await api.put<User>(`/users/${id}/role`, { role })
        return data
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/users/${id}`)
    },
}