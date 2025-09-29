import api from '../../client'
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User,
    ChangePasswordRequest
} from '../auth.types'

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials)
        return data
    },

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>('/auth/register', userData)
        return data
    },

    async getProfile(): Promise<User> {
        const { data } = await api.get<User>('/auth/me')
        return data
    },

    async changePassword(passwords: ChangePasswordRequest): Promise<void> {
        await api.put('/auth/change-password', passwords)
    },

    async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
        const { data } = await api.post('/auth/refresh')
        return data
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout')
    },
}