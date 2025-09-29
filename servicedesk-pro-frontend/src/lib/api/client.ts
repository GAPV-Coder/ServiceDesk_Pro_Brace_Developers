import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_URL } from '../utils/constants'

class ApiClient {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        })

        this.setupInterceptors()
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = this.getToken()
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            (error) => Promise.reject(error)
        )

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response?.status === 401) {
                    this.clearToken()
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login'
                    }
                }
                return Promise.reject(error)
            }
        )
    }

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('access_token')
        }
        return null
    }

    private clearToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
        }
    }

    public setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', token)
        }
    }

    get axios(): AxiosInstance {
        return this.client
    }
}

export const apiClient = new ApiClient()
export default apiClient.axios