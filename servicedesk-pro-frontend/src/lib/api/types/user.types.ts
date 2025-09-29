import { QueryParams } from './common.types'

export interface CreateUserRequest {
    email: string
    password: string
    firstName: string
    lastName: string
    role?: 'requester' | 'agent' | 'manager'
    department?: string
    jobTitle?: string
}

export interface UpdateUserRequest {
    firstName?: string
    lastName?: string
    department?: string
    jobTitle?: string
    status?: string
    role?: 'requester' | 'agent' | 'manager'
}

export interface UserQueryParams extends QueryParams {
    role?: string
    status?: string
    department?: string
}

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: "manager" | "agent" | "requester"
    createdAt: string
    updatedAt: string
}