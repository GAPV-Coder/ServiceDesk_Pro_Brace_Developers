export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    firstName: string
    lastName: string
    department?: string
    jobTitle?: string
}

export interface AuthResponse {
    user: User
    accessToken: string
    tokenType: string
    expiresIn: number
}

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'requester' | 'agent' | 'manager'
    department: string
    jobTitle: string
    status: string
    createdAt: string
    lastLoginAt?: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}